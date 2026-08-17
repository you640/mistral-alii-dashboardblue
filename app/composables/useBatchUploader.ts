import { useForenzStore } from '~/stores/forenzStore'
import { useAiAnalyzer } from '~/composables/useAiAnalyzer'

export interface BatchItem {
  id: string
  file: File
  name: string
  size: number
  type: 'pdf' | 'image' | 'text' | 'unknown'
  status: 'queued' | 'processing' | 'done' | 'error'
  progress: number
  error?: string
  extractedStats?: {
    persons: number
    claims: number
    contradictions: number
  }
}

export function useBatchUploader() {
  const store = useForenzStore()
  const toast = useToast()
  const { analyzeDocument } = useAiAnalyzer()

  const queue = ref<BatchItem[]>([])
  const isProcessing = ref(false)
  const currentItemIndex = ref(0)

  const overallProgress = computed(() => {
    if (queue.value.length === 0) return 0
    const doneCount = queue.value.filter(i => i.status === 'done').length
    return Math.round((doneCount / queue.value.length) * 100)
  })

  function detectFileType(file: File): BatchItem['type'] {
    const mime = (file.type || '').toLowerCase()
    const name = (file.name || '').toLowerCase()

    if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
    if (mime.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(name)) return 'image'
    if (mime.includes('text') || /\.(txt|md|csv)$/i.test(name)) return 'text'
    return 'unknown'
  }

  function addFilesToQueue(files: FileList | File[]) {
    const fileArray = Array.from(files)
    const newItems: BatchItem[] = fileArray.map((file) => ({
      id: `batch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      type: detectFileType(file),
      status: 'queued',
      progress: 0
    }))

    queue.value.push(...newItems)

    toast.add({
      title: 'Súbory pridané do fronty',
      description: `Pridaných: ${newItems.length} súborov (PDF / PNG / obrázky / text).`,
      color: 'info'
    })
  }

  function removeItem(id: string) {
    queue.value = queue.value.filter(i => i.id !== id)
  }

  function clearQueue() {
    if (isProcessing.value) {
      toast.add({ title: 'Upozornenie', description: 'Počkajte na dokončenie bežiacej analýzy.', color: 'warning' })
      return
    }
    queue.value = []
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error(`Chyba pri čítaní obrázku: ${file.name}`))
      reader.readAsDataURL(file)
    })
  }

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error(`Chyba pri čítaní textu: ${file.name}`))
      reader.readAsText(file)
    })
  }

  async function startBatchAnalysis() {
    const pendingItems = queue.value.filter(i => i.status === 'queued' || i.status === 'error')
    if (pendingItems.length === 0) {
      toast.add({ title: 'Fronta je prázdna', description: 'Pridajte súbory na analýzu.', color: 'warning' })
      return
    }

    isProcessing.value = true
    let successfulCount = 0

    for (let i = 0; i < queue.value.length; i++) {
      const item = queue.value[i]
      if (!item || item.status === 'done') continue

      currentItemIndex.value = i
      item.status = 'processing'
      item.progress = 20

      try {
        const docTitle = item.name.replace(/\.[^/.]+$/, '')
        let res: { ok: boolean; docId?: string; data?: any; error?: string }

        if (item.type === 'image') {
          item.progress = 40
          const dataUrl = await readFileAsDataUrl(item.file)
          item.progress = 60
          res = await analyzeDocument({
            title: docTitle,
            imageDataUrl: dataUrl
          })
        }
        else {
          item.progress = 40
          const text = await readFileAsText(item.file)
          item.progress = 60
          res = await analyzeDocument({
            title: docTitle,
            text
          })
        }

        if (res && res.ok) {
          item.status = 'done'
          item.progress = 100
          item.extractedStats = {
            persons: res.data?.nodes?.length || 0,
            claims: res.data?.claims?.length || 0,
            contradictions: res.data?.contradictions?.length || 0
          }
          successfulCount++
        }
        else {
          item.status = 'error'
          item.error = res?.error || 'Zlyhanie analýzy'
        }
      }
      catch (err: any) {
        item.status = 'error'
        item.error = err.message || 'Chyba spracovania súboru'
      }
    }

    isProcessing.value = false

    toast.add({
      title: 'Hromadný import dokončený',
      description: `Úspešne analyzovaných: ${successfulCount} z ${queue.value.length} dokumentov.`,
      color: 'success'
    })
  }

  return {
    queue,
    isProcessing,
    currentItemIndex,
    overallProgress,
    addFilesToQueue,
    removeItem,
    clearQueue,
    startBatchAnalysis
  }
}
