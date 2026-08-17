/**
 * PWA Service Worker registrácia — client-side only plugin.
 * Registruje /sw.js a poskytuje install prompt composable.
 */
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  // Registrácia Service Workera
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      console.log('[PWA] Service Worker registered:', registration.scope)

      // Automatická aktualizácia pri novej verzii
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('[PWA] Nová verzia dostupná — obnovte stránku.')
          }
        })
      })
    }
    catch (error) {
      console.warn('[PWA] Service Worker registration failed:', error)
    }
  })

  // Zachytenie "beforeinstallprompt" eventu pre manuálny install
  const deferredPrompt = ref(null)
  const canInstall = ref(false)

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    canInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    canInstall.value = false
    console.log('[PWA] Aplikácia nainštalovaná.')
  })

  // Provide composable pre install prompt
  return {
    provide: {
      pwa: {
        canInstall,
        async promptInstall() {
          const prompt = deferredPrompt.value
          if (!prompt) return false
          prompt.prompt()
          const { outcome } = await prompt.userChoice
          deferredPrompt.value = null
          canInstall.value = false
          return outcome === 'accepted'
        }
      }
    }
  }
})
