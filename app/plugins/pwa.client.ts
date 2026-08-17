export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        // Detekcia nového Service Workera v pozadí
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.info('PWA: K dispozícii je nová verzia platformy Alibi.')
              }
            })
          }
        })
      } catch (err) {
        console.warn('PWA: Registrácia Service Worker zlyhala:', err)
      }
    })

    // Automatický reload pri aktivácii nového Service Workera
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  }
})
