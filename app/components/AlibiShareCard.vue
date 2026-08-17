<script setup lang="ts">
import type { Contradiction } from '~/types'

const props = defineProps<{
  open: boolean
  contradiction: Contradiction | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const toast = useToast()
const isCopied = ref(false)

const shareText = computed(() => {
  if (!props.contradiction) return ''
  return `🚨 ALIBI IMPOSSIBLE DETEKCIA — Forenzná Platforma Alibi\n\n`
    + `Rozpor: ${props.contradiction.explanation}\n`
    + `Subjekt: ${props.contradiction.entityRef || 'Neznámy'}\n`
    + `Závažnosť: ${props.contradiction.severity === 'high' ? 'Kritická' : props.contradiction.severity === 'medium' ? 'Stredná' : 'Nízka'}\n\n`
    + `Vyšetrené systémom Alibi AI: https://dashboard-4libi-chi.vercel.app`
})

async function handleShare() {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'Alibi Impossible — Forenzný Rozpor',
        text: shareText.value,
        url: 'https://dashboard-4libi-chi.vercel.app'
      })
    } catch {
      // User cancelled
    }
  } else {
    handleCopy()
  }
}

async function handleCopy() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText.value)
      isCopied.value = true
      toast.add({
        title: 'Skopírované do schránky',
        description: 'Sumár rozporu bol pripravený na zdieľanie.',
        color: 'success'
      })
      setTimeout(() => {
        isCopied.value = false
      }, 2500)
    } catch {
      toast.add({ title: 'Kopírovanie zlyhalo', color: 'error' })
    }
  }
}

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #content>
      <div v-if="contradiction" class="p-6 space-y-5 bg-default/95 backdrop-blur-xl rounded-2xl border border-default">
        <!-- Hlavička karty s neon badge -->
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <UIcon name="i-lucide-alert-triangle" class="size-3.5" />
                Alibi Impossible
              </span>
              <UBadge
                :color="contradiction.severity === 'high' ? 'error' : contradiction.severity === 'medium' ? 'warning' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ contradiction.severity === 'high' ? 'Kritický' : contradiction.severity === 'medium' ? 'Stredný' : 'Nízky' }}
              </UBadge>
            </div>
            <h3 class="text-lg font-bold text-foreground">
              {{ contradiction.entityRef || 'Podozrivý' }} tvrdí, že bol na inom mieste
            </h3>
            <p class="text-xs text-muted">
              AI forenzný analyzátor detegoval nezlučiteľný rozpor v spisoch.
            </p>
          </div>

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="handleClose"
          />
        </div>

        <!-- Box rozporu -->
        <div class="p-4 rounded-xl bg-default/60 border border-default/80 space-y-2">
          <div class="flex items-center justify-between text-xs text-muted font-medium">
            <span class="text-primary font-semibold">Podstata rozporu:</span>
            <span>Spoľahlivosť {{ Math.round((contradiction.confidence || 0.9) * 100) }} %</span>
          </div>
          <p class="text-sm font-semibold text-foreground leading-relaxed">
            {{ contradiction.explanation }}
          </p>
        </div>

        <!-- Porovnávací Grid: Alibi vs Zistenie -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <UIcon name="i-lucide-shield-alert" class="size-3" />
              Tvrdené Alibi
            </span>
            <p class="text-xs text-foreground/90 font-medium">
              Uvádza neprítomnosť na mieste činu v rozhodujúcom čase.
            </p>
          </div>

          <div class="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <UIcon name="i-lucide-crosshair" class="size-3" />
              Forenzný Fakt
            </span>
            <p class="text-xs text-foreground/90 font-medium">
              Svedectvo alebo geolokačný engine vyvracia možnosť presunu.
            </p>
          </div>
        </div>

        <!-- Tlačidlá akcií -->
        <div class="flex items-center gap-3 pt-2">
          <UButton
            icon="i-lucide-share-2"
            label="Zdieľať protokol"
            color="primary"
            class="flex-1 justify-center"
            @click="handleShare"
          />
          <UButton
            :icon="isCopied ? 'i-lucide-check' : 'i-lucide-copy'"
            :label="isCopied ? 'Skopírované' : 'Kopírovať'"
            :color="isCopied ? 'success' : 'neutral'"
            variant="outline"
            @click="handleCopy"
          />
          <UButton
            label="Zavrieť"
            color="neutral"
            variant="ghost"
            @click="handleClose"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
