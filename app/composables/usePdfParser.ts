import * as pdfjsLib from 'pdfjs-dist'

export function usePdfParser() {
  const isParsing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function extractTextFromPdf(file: File): Promise<string> {
    isParsing.value = true
    progress.value = 0
    error.value = null

    try {
      if (typeof window !== 'undefined') {
        // Nastavenie PDF.js worker cesty
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
      }

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const numPages = pdf.numPages

      let fullText = ''

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')

        fullText += `\n--- Strana ${pageNum} ---\n` + pageText
        progress.value = Math.round((pageNum / numPages) * 100)
      }

      return fullText.trim()
    } catch (err: any) {
      error.value = err.message || 'Nepodarilo sa extrahovať text z PDF'
      throw err
    } finally {
      isParsing.value = false
    }
  }

  return {
    isParsing,
    progress,
    error,
    extractTextFromPdf
  }
}
