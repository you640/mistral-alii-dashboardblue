<script setup lang="ts">
import { useForenzStore } from '~/stores/forenzStore'

const store = useForenzStore()

const stats = computed(() => store.analysisStats)
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Prehľad">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Štatistiky -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2 text-muted mb-1">
            <UIcon name="i-lucide-file-text" class="size-4" />
            <span class="text-xs font-medium uppercase tracking-wider">Spisy</span>
          </div>
          <div class="text-2xl font-bold">
            {{ stats.totalDocuments }}
          </div>
          <div class="text-xs text-muted mt-1">
            {{ stats.analyzedDocuments }} analyzovaných
          </div>
        </div>

        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2 text-muted mb-1">
            <UIcon name="i-lucide-users" class="size-4" />
            <span class="text-xs font-medium uppercase tracking-wider">Osoby</span>
          </div>
          <div class="text-2xl font-bold">
            {{ stats.totalPersons }}
          </div>
          <div class="text-xs text-muted mt-1">
            {{ stats.totalClaims }} tvrdení
          </div>
        </div>

        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2 mb-1" style="color: var(--color-severity-high)">
            <UIcon name="i-lucide-alert-triangle" class="size-4" />
            <span class="text-xs font-medium uppercase tracking-wider">Rozpory</span>
          </div>
          <div class="text-2xl font-bold">
            {{ stats.totalContradictions }}
          </div>
          <div class="text-xs text-muted mt-1">
            {{ stats.confirmedContradictions }} potvrdených · {{ stats.highSeverityCount }} vysoká závažnosť
          </div>
        </div>

        <div class="rounded-lg border border-default bg-default p-4">
          <div class="flex items-center gap-2 text-muted mb-1">
            <UIcon name="i-lucide-flag" class="size-4" />
            <span class="text-xs font-medium uppercase tracking-wider">Red Flags</span>
          </div>
          <div class="text-2xl font-bold">
            {{ stats.totalRedFlags }}
          </div>
          <div class="text-xs text-muted mt-1">
            {{ stats.totalEvents }} udalostí · {{ stats.totalLocations }} miest
          </div>
        </div>
      </div>

      <!-- Prázdny stav -->
      <div v-if="stats.totalDocuments === 0" class="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div class="flex size-16 items-center justify-center rounded-full bg-blue-500/10 mb-4">
          <UIcon name="i-lucide-file-plus" class="size-8 text-blue-500" />
        </div>
        <h3 class="text-lg font-semibold mb-2">
          Žiadne spisy
        </h3>
        <p class="text-muted text-sm max-w-md mb-6">
          Nahrajte výpoveď svedka alebo dokument na analýzu. AI automaticky extrahuje osoby, udalosti, tvrdenia a detekuje rozpory.
        </p>
        <UButton
          icon="i-lucide-upload"
          label="Nahrať spis"
          to="/documents"
          size="lg"
        />
      </div>

      <!-- Zoznam posledných rozporov -->
      <div v-if="store.contradictions.length > 0" class="px-4 pb-4">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
          Posledné rozpory
        </h3>
        <div class="space-y-2">
          <div
            v-for="c in store.contradictions.slice(0, 5)"
            :key="c.id"
            class="flex items-start gap-3 p-3 rounded-lg border border-default bg-default"
          >
            <UBadge
              :color="c.severity === 'high' ? 'error' : c.severity === 'medium' ? 'warning' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              {{ c.severity }}
            </UBadge>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ c.entity_ref || c.type }}
              </p>
              <p class="text-xs text-muted line-clamp-2">
                {{ c.explanation || 'Bez vysvetlenia' }}
              </p>
            </div>
            <UBadge variant="outline" size="xs">
              {{ c.status }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
