import { defineEventHandler, readBody, createError } from 'h3'
import { createOCRService } from '../../utils/ocrService'
import { Base44OCREntityHelper } from '../../utils/base44OcrHelper'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fileBase64, fileName, mimeType, caseId } = body

  if (!fileBase64) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chýbajú dáta súboru (fileBase64)'
    })
  }

  const ocrService = createOCRService()
  const helper = new Base44OCREntityHelper(ocrService)

  const buffer = Buffer.from(fileBase64, 'base64')

  try {
    const documentEntity = await helper.processCaseDocument({
      caseId: caseId || 'default_case',
      fileName: fileName || 'dokument',
      fileBuffer: buffer,
      mimeType: mimeType || 'application/pdf'
    })

    return {
      success: true,
      document: documentEntity
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Chyba OCR spracovania: ${err.message}`
    })
  }
})
