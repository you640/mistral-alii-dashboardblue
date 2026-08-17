import { OCRService } from './ocrService'

export interface CaseDocumentInput {
  id?: string
  caseId: string
  fileName: string
  filePath?: string
  fileBuffer?: Buffer
  mimeType?: string
  uploadedBy?: string
}

export interface CaseDocumentEntity {
  id: string
  case_id: string
  file_name: string
  source_type: 'pdf' | 'image' | 'text'
  extracted_text: string
  page_count: number
  sha256_hash?: string
  status: 'pending' | 'processed' | 'failed'
  ocr_confidence: number
  created_at: string
  updated_at: string
}

export class Base44OCREntityHelper {
  private ocrService: OCRService

  constructor(ocrService?: OCRService) {
    this.ocrService = ocrService || new OCRService()
  }

  /**
   * Spracuje dokument cez OCR a namapuje ho na CaseDocument entitu pre Base44
   */
  async processCaseDocument(input: CaseDocumentInput): Promise<CaseDocumentEntity> {
    const buffer = input.fileBuffer || (input.filePath ? await import('fs').then(fs => fs.promises.readFile(input.filePath!)) : Buffer.from(''))

    const ocrResult = await this.ocrService.extractText(buffer, input.mimeType)

    const crypto = await import('crypto')
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')

    const entity: CaseDocumentEntity = {
      id: input.id || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      case_id: input.caseId,
      file_name: input.fileName,
      source_type: ocrResult.sourceType,
      extracted_text: ocrResult.text,
      page_count: ocrResult.pageCount || 1,
      sha256_hash: sha256,
      status: 'processed',
      ocr_confidence: ocrResult.confidence || 0.95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return entity
  }

  /**
   * Uloží spracovaný dokument priamo do Base44 SDK backendu
   */
  async processAndSaveCaseDocument(input: CaseDocumentInput, base44Client?: any): Promise<CaseDocumentEntity> {
    const documentEntity = await this.processCaseDocument(input)

    if (base44Client?.entities?.CaseDocument?.create) {
      try {
        await base44Client.entities.CaseDocument.create({
          caseId: documentEntity.case_id,
          fileName: documentEntity.file_name,
          sourceType: documentEntity.source_type,
          extractedText: documentEntity.extracted_text,
          pageCount: documentEntity.page_count,
          sha256: documentEntity.sha256_hash,
          status: documentEntity.status
        })
      } catch (err) {
        console.warn('Ukladanie do Base44 CaseDocument entity zlyhalo, vraciam lokálnu entitu:', err)
      }
    }

    return documentEntity
  }
}
