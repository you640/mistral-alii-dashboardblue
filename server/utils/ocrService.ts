import axios from 'axios'
import { promises as fs } from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export interface OCROptions {
  apiKey?: string
  model?: string
  maxRetries?: number
  concurrency?: number
}

export interface OCRResult {
  text: string
  pageCount?: number
  sourceType: 'pdf' | 'image' | 'text'
  confidence?: number
  processingTimeMs: number
}

export class OCRService {
  private apiKey: string
  private model: string
  private maxRetries: number
  private concurrency: number

  constructor(options: OCROptions = {}) {
    this.apiKey = options.apiKey || process.env.MISTRAL_API_KEY || ''
    this.model = options.model || 'pixtral-large-latest'
    this.maxRetries = options.maxRetries || 3
    this.concurrency = options.concurrency || 2
  }

  /**
   * Automaticky deteguje formát a extrahuje text zo súboru (PDF, obrázok, text)
   */
  async extractText(filePathOrBuffer: string | Buffer, mimeType?: string): Promise<OCRResult> {
    const startTime = Date.now()

    let buffer: Buffer
    let ext = ''

    if (typeof filePathOrBuffer === 'string') {
      buffer = await fs.readFile(filePathOrBuffer)
      ext = path.extname(filePathOrBuffer).toLowerCase()
    } else {
      buffer = filePathOrBuffer
      if (mimeType) {
        if (mimeType.includes('pdf')) ext = '.pdf'
        else if (mimeType.includes('png')) ext = '.png'
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg'
        else if (mimeType.includes('webp')) ext = '.webp'
      }
    }

    // 1. PDF spracovanie
    if (ext === '.pdf' || (!ext && buffer.slice(0, 4).toString() === '%PDF')) {
      return this.extractFromPdf(buffer, startTime)
    }

    // 2. Obrázky (PNG, JPG, WebP, GIF, TIFF) cez Pixtral Vision
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.tiff']
    if (imageExtensions.includes(ext) || mimeType?.startsWith('image/')) {
      const imgMime = mimeType || this.getMimeFromExt(ext)
      return this.extractFromImage(buffer, imgMime, startTime)
    }

    // 3. Fallback na čistý text
    const text = buffer.toString('utf-8')
    return {
      text: this.cleanTextForSearch(text),
      sourceType: 'text',
      processingTimeMs: Date.now() - startTime
    }
  }

  /**
   * Extrakcia textu z PDF pomocou pdf-parse
   */
  private async extractFromPdf(buffer: Buffer, startTime: number): Promise<OCRResult> {
    try {
      const pdfParse = require('pdf-parse')
      const pdfData = await pdfParse(buffer)

      const text = this.cleanTextForSearch(pdfData.text || '')
      return {
        text,
        pageCount: pdfData.numpages || 1,
        sourceType: 'pdf',
        processingTimeMs: Date.now() - startTime
      }
    } catch {
      // Fallback na text extrakciu ak pdf-parse zlyhá
      const text = buffer.toString('utf-8').replace(/[^\x20-\x7E\s\u00C0-\u024F]/g, '')
      return {
        text: this.cleanTextForSearch(text),
        pageCount: 1,
        sourceType: 'pdf',
        processingTimeMs: Date.now() - startTime
      }
    }
  }

  /**
   * Extrakcia textu z obrázku cez Mistral Pixtral Vision API
   */
  private async extractFromImage(buffer: Buffer, mimeType: string, startTime: number): Promise<OCRResult> {
    const base64Image = buffer.toString('base64')
    const dataUri = `data:${mimeType};base64,${base64Image}`

    let attempts = 0
    let lastError: any = null

    while (attempts < this.maxRetries) {
      try {
        attempts++
        const response = await axios.post(
          'https://api.mistral.ai/v1/chat/completions',
          {
            model: this.model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extrahuj VŠETOK text z tohto forenzného dokumentu/zápisnice doslovne a presne. Zachovaj štruktúru, odstavce, dátumy a čísla. Nevynechaj žiadne údaje.'
                  },
                  {
                    type: 'image_url',
                    image_url: dataUri
                  }
                ]
              }
            ],
            temperature: 0.1
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`
            },
            timeout: 60000
          }
        )

        const rawText = response.data?.choices?.[0]?.message?.content || ''
        const cleanedText = this.cleanTextForSearch(rawText)

        return {
          text: cleanedText,
          pageCount: 1,
          sourceType: 'image',
          confidence: 0.95,
          processingTimeMs: Date.now() - startTime
        }
      } catch (err: any) {
        lastError = err
        if (attempts < this.maxRetries) {
          // Exponential backoff
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts)))
        }
      }
    }

    throw new Error(`OCR extrakcia z obrázku zlyhala po ${this.maxRetries} pokusoch: ${lastError?.message || 'Neznáma chyba'}`)
  }

  /**
   * Dávková extrakcia viacerých dokumentov s obmedzenou konkurenciou
   */
  async extractBatch(files: Array<{ buffer: Buffer, mimeType?: string, id?: string }>): Promise<Array<{ id?: string, result: OCRResult }>> {
    const results: Array<{ id?: string, result: OCRResult }> = []
    const queue = [...files]

    const workers = Array(this.concurrency).fill(null).map(async () => {
      while (queue.length > 0) {
        const item = queue.shift()
        if (!item) break
        const result = await this.extractText(item.buffer, item.mimeType)
        results.push({ id: item.id, result })
      }
    })

    await Promise.all(workers)
    return results
  }

  /**
   * Normalizácia a optimalizácia textu pre Base44 full-text search
   */
  cleanTextForSearch(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  private getMimeFromExt(ext: string): string {
    switch (ext) {
      case '.png': return 'image/png'
      case '.jpg':
      case '.jpeg': return 'image/jpeg'
      case '.webp': return 'image/webp'
      case '.gif': return 'image/gif'
      case '.tiff': return 'image/tiff'
      default: return 'image/png'
    }
  }
}

export function createOCRService(options?: OCROptions): OCRService {
  return new OCRService(options)
}
