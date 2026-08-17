import { useForenzStore } from '~/stores/forenzStore'
import { namesMatch, parseTimeToMinutes } from '~/utils/forenzCore'
import type { ForensicClaim, Contradiction } from '~/types'

export interface AnalysisStatus {
  isAnalyzing: boolean
  step: string
  progress: number
  error: string | null
}

export function useAiAnalyzer() {
  const store = useForenzStore()
  const toast = useToast()

  const status = ref<AnalysisStatus>({
    isAnalyzing: false,
    step: '',
    progress: 0,
    error: null
  })

  // Krížová detekcia rozporov medzi novo extrahovanými tvrdeniami a existujúcimi tvrdeniami v store
  function runLocalContradictionDetection(newDocId: string) {
    const allClaims = (store.claims || []) as ForensicClaim[]
    const newClaims = allClaims.filter(c => c.document_id === newDocId)
    const existingClaims = allClaims.filter(c => c.document_id !== newDocId)

    const detectedContradictions: Partial<Contradiction>[] = []

    for (const nClaim of newClaims) {
      for (const eClaim of existingClaims) {
        // Kontrola, či sa tvrdenia týkajú rovnakej osoby/subjektu
        if (nClaim.subject && eClaim.subject && namesMatch(nClaim.subject, eClaim.subject)) {
          const nTime = parseTimeToMinutes(nClaim.event_time)
          const eTime = parseTimeToMinutes(eClaim.event_time)

          // Časovo-priestorový rozpor: Rovnaký alebo blízky čas (<= 45 min), ale iná lokalita/objekt
          if (nTime !== null && eTime !== null && Math.abs(nTime - eTime) <= 45) {
            if (nClaim.object && eClaim.object && nClaim.object.toLowerCase() !== eClaim.object.toLowerCase()) {
              detectedContradictions.push({
                id: `contra_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                claim_a_id: eClaim.id,
                claim_b_id: nClaim.id,
                document_a_id: eClaim.document_id || '',
                document_b_id: nClaim.document_id || '',
                entity_ref: nClaim.subject,
                type: 'location_time_conflict',
                severity: 'high',
                confidence: 0.9,
                explanation: `Časovo-priestorový rozpor: ${eClaim.document_title || 'Dokument 1'} uvádza pobyt v "${eClaim.object}" o ${eClaim.event_time}, zatiaľ čo ${nClaim.document_title || 'Dokument 2'} uvádza "${nClaim.object}" o ${nClaim.event_time}.`,
                status: 'possible',
                document_id: newDocId,
                document_title: nClaim.document_title
              })
            }
          }
        }
      }
    }

    if (detectedContradictions.length > 0) {
      store.addContradictions(detectedContradictions)
    }
  }

  async function analyzeDocument({
    title,
    text,
    imageDataUrl
  }: {
    title: string
    text?: string
    imageDataUrl?: string
  }) {
    status.value = {
      isAnalyzing: true,
      step: 'Príprava dokumentu...',
      progress: 15,
      error: null
    }

    try {
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('mistral_api_key') || '' : ''

      status.value = {
        isAnalyzing: true,
        step: imageDataUrl ? 'Odosielanie do Mistral Pixtral (Vision AI)...' : 'AI Analýza výpovede cez Mistral AI...',
        progress: 40,
        error: null
      }

      // Volanie backend endpointu
      const res = await $fetch<{ ok: boolean; source: string; model?: string; data: any }>('/api/forenz/analyze', {
        method: 'POST',
        body: {
          title,
          text,
          image_url: imageDataUrl,
          apiKey
        }
      })

      if (!res || !res.ok || !res.data) {
        throw new Error('Analýza nevrátila žiadne dáta.')
      }

      status.value = {
        isAnalyzing: true,
        step: 'Extrakcia osôb, tvrdení a udalostí...',
        progress: 70,
        error: null
      }

      // 1. Zápis dokumentu do store
      const docId = store.addDocument({
        title,
        status: 'analyzing',
        summary: res.data.summary || 'Spracovaná výpoveď.',
        person_count: res.data.nodes?.length || 0,
        relationship_count: res.data.edges?.length || 0,
        red_flag_count: res.data.red_flags?.length || 0,
        created_at: new Date().toISOString()
      })

      // 2. Zlúčenie entít do databázy
      store.mergeAnalysisResults(docId, res.data)

      status.value = {
        isAnalyzing: true,
        step: 'Krížová kontrola alibi a detekcia rozporov...',
        progress: 90,
        error: null
      }

      // 3. Spustenie detekcie rozporov
      runLocalContradictionDetection(docId)

      // 4. Uloženie do perzistentnej pamäte
      store.saveToLocalStorage()

      status.value = {
        isAnalyzing: false,
        step: 'Analýza úspešne dokončená!',
        progress: 100,
        error: null
      }

      toast.add({
        title: 'Výpoveď analyzovaná',
        description: `Extrahovaných: ${res.data.nodes?.length || 0} osôb, ${res.data.claims?.length || 0} tvrdení.`,
        color: 'success'
      })

      return { ok: true, docId, data: res.data }
    }
    catch (err: any) {
      status.value = {
        isAnalyzing: false,
        step: 'Chyba analýzy',
        progress: 0,
        error: err.message || 'Nepodarilo sa vykonať analýzu.'
      }

      toast.add({
        title: 'Chyba analýzy',
        description: err.message,
        color: 'error'
      })

      return { ok: false, error: err.message }
    }
  }

  return {
    status,
    analyzeDocument
  }
}
