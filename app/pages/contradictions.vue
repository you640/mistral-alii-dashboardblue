<script setup lang="ts">
import { useForenzStore } from '~/stores/forenzStore'
import type { ContradictionStatus, Severity } from '~/types'

const store = useForenzStore()
const toast = useToast()

const selectedSeverity = ref<string>('all')
const selectedStatus = ref<string>('all')

const filteredContradictions = computed(() => {
  return store.contradictions.filter((c) => {
    const matchesSev = selectedSeverity.value === 'all' || c.severity === selectedSeverity.value
    const matchesStat = selectedStatus.value === 'all' || c.status === selectedStatus.value
    return matchesSev && matchesStat
  })
})

function updateStatus(id: string, newStatus: ContradictionStatus) {
  store.setContradictionStatus(id, newStatus)
  store.saveToLocalStorage()
  toast.add({
    title: 'Stav rozporu aktualizovaný',
    description: `Rozpor bol označený ako: ${newStatus}`,
    color: newStatus === 'confirmed' ? 'success' : newStatus === 'dismissed' ? 'neutral' : 'warning'
  })
}

function getSeverityColor(sev: Severity | string) {
  switch (sev) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'neutral'
    default: return 'neutral'
  }
}
</script>

<template>
  <UDashboardPanel id="contradictions">
    <template #header>
      <UDashboardNavbar title="Detekované Rozpory">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UBadge color="error" variant="subtle">
              {{ store.highSeverityContradictions.length }} Vysoká závažnosť
            </UBadge>
            <UBadge color="success" variant="subtle">
              {{ store.confirmedContradictions.length }} Potvrdené
            </UBadge>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-6">
        <!-- Filtre -->
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-default bg-default/40">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-semibold text-muted uppercase">Závažnosť:</span>
            <UButton
              v-for="sev in ['all', 'high', 'medium', 'low']"
              :key="sev"
              :label="sev === 'all' ? 'Všetky' : sev === 'high' ? 'Vysoká' : sev === 'medium' ? 'Stredná' : 'Nízka'"
              :variant="selectedSeverity === sev ? 'solid' : 'ghost'"
              :color="selectedSeverity === sev ? 'primary' : 'neutral'"
              size="xs"
              @click="selectedSeverity = sev"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-semibold text-muted uppercase">Stav:</span>
            <UButton
              v-for="st in ['all', 'possible', 'confirmed', 'dismissed']"
              :key="st"
              :label="st === 'all' ? 'Všetky' : st === 'possible' ? 'K posúdeniu' : st === 'confirmed' ? 'Potvrdené' : 'Zamietnuté'"
              :variant="selectedStatus === st ? 'solid' : 'ghost'"
              :color="selectedStatus === st ? 'primary' : 'neutral'"
              size="xs"
              @click="selectedStatus = st"
            />
          </div>
        </div>

        <!-- Prázdny stav -->
        <div v-if="filteredContradictions.length === 0" class="text-center py-16 border border-dashed border-default rounded-xl">
          <UIcon name="i-lucide-check-circle-2" class="size-12 text-emerald-500 mx-auto mb-2 opacity-60" />
          <h3 class="font-semibold text-base mb-1">
            Žiadne nájdené rozpory
          </h3>
          <p class="text-sm text-muted max-w-sm mx-auto mb-4">
            V aktuálnom výbere sa nenachádzajú žiadne nezrovnalosti medzi výpoveďami.
          </p>
          <UButton label="Nahrať spis" to="/documents" icon="i-lucide-upload" size="sm" />
        </div>

        <!-- Karty rozporov -->
        <div v-else class="space-y-4">
          <div
            v-for="contra in filteredContradictions"
            :key="contra.id"
            class="p-5 rounded-xl border border-default bg-default space-y-4 hover:border-primary/40 transition"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <UBadge :color="getSeverityColor(contra.severity)" variant="subtle" size="sm">
                  {{ contra.severity === 'high' ? 'Kritický rozpor' : contra.severity === 'medium' ? 'Stredný rozpor' : 'Nízky rozpor' }}
                </UBadge>
                <span class="font-bold text-sm text-foreground">{{ contra.entity_ref || 'Všeobecný rozpor' }}</span>
                <span class="text-xs text-muted">({{ contra.type }})</span>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-xs text-muted mr-2">Istota AI: {{ Math.round((contra.confidence || 0.5) * 100) }}%</span>
                <UBadge
                  :color="contra.status === 'confirmed' ? 'success' : contra.status === 'dismissed' ? 'neutral' : 'warning'"
                  variant="outline"
                  size="xs"
                >
                  {{ contra.status }}
                </UBadge>
              </div>
            </div>

            <!-- Vysvetlenie rozporu -->
            <p class="text-sm bg-rose-500/5 border border-rose-500/20 p-3 rounded-lg text-rose-300">
              {{ contra.explanation }}
            </p>

            <!-- Akcie pre vyšetrovateľa (Human-in-the-loop) -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-default/50">
              <span class="text-xs text-muted mr-auto">Posúdenie vyšetrovateľa:</span>
              <UButton
                icon="i-lucide-check"
                label="Potvrdiť rozpor"
                color="success"
                variant="subtle"
                size="xs"
                :disabled="contra.status === 'confirmed'"
                @click="updateStatus(contra.id, 'confirmed')"
              />
              <UButton
                icon="i-lucide-x"
                label="Zamietnuť"
                color="neutral"
                variant="ghost"
                size="xs"
                :disabled="contra.status === 'dismissed'"
                @click="updateStatus(contra.id, 'dismissed')"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
