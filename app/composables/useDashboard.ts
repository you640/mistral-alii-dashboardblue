import { createSharedComposable } from '@vueuse/core'

const _useDashboard = () => {
  const route = useRoute()
  const router = useRouter()

  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-d': () => router.push('/documents'),
    'g-p': () => router.push('/persons'),
    'g-c': () => router.push('/contradictions'),
    'g-g': () => router.push('/graph'),
    'g-t': () => router.push('/timeline')
  })

  return {}
}

export const useDashboard = createSharedComposable(_useDashboard)
