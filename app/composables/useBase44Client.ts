import { createClient } from '@base44/sdk'

let clientInstance: any = null

export function useBase44Client() {
  const config = useRuntimeConfig()

  if (!clientInstance) {
    const appId = (typeof window !== 'undefined' && localStorage.getItem('base44_app_id'))
      || config.public.base44AppId
      || '6a81f5e7f4adbf6a9523b9d8'

    const apiKey = (typeof window !== 'undefined' && localStorage.getItem('base44_api_key'))
      || 'fafad43d1f2e4c0ea0724f2e33181a39'

    clientInstance = createClient({
      appId,
      headers: {
        api_key: apiKey
      }
    })
  }

  return {
    base44: clientInstance
  }
}
