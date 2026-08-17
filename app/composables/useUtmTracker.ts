export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  captured_at: string
}

export function useUtmTracker() {
  const route = useRoute()
  const utmData = ref<UtmParams | null>(null)

  function captureUtm() {
    if (typeof window === 'undefined') return

    const query = route.query
    const hasUtm = query.utm_source || query.utm_medium || query.utm_campaign || query.gclid

    if (hasUtm) {
      const params: UtmParams = {
        utm_source: String(query.utm_source || ''),
        utm_medium: String(query.utm_medium || ''),
        utm_campaign: String(query.utm_campaign || ''),
        utm_term: String(query.utm_term || ''),
        utm_content: String(query.utm_content || ''),
        gclid: String(query.gclid || ''),
        captured_at: new Date().toISOString()
      }

      localStorage.setItem('alibi_utm_params', JSON.stringify(params))
      utmData.value = params
    } else {
      const stored = localStorage.getItem('alibi_utm_params')
      if (stored) {
        try {
          utmData.value = JSON.parse(stored)
        } catch {
          // ignore
        }
      }
    }
  }

  onMounted(() => {
    captureUtm()
  })

  return {
    utmData,
    captureUtm
  }
}
