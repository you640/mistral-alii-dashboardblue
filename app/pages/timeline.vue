<script setup lang="ts">
import { useForenzStore } from '~/stores/forenzStore'

const store = useForenzStore()

const events = computed(() => store.timelineEvents)
</script>

<template>
  <UDashboardPanel id="timeline">
    <template #header>
      <UDashboardNavbar title="Chronologická Časová Os">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UBadge color="primary" variant="subtle">
            {{ events.length }} Zaznamenaných udalostí
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-6 max-w-4xl mx-auto">
        <!-- Prázdny stav -->
        <div v-if="events.length === 0" class="text-center py-20 border border-dashed border-default rounded-xl">
          <UIcon name="i-lucide-clock" class="size-12 text-muted mx-auto mb-2 opacity-50" />
          <h3 class="font-semibold text-base mb-1">
            Žiadne udalosti na časovej osi
          </h3>
          <p class="text-sm text-muted max-w-sm mx-auto mb-4">
            AI automaticky extrahuje časové údaje a udalosti z nahraných výpovedí.
          </p>
          <UButton label="Nahrať spis" to="/documents" icon="i-lucide-upload" size="sm" />
        </div>

        <!-- Časová os -->
        <div v-else class="relative border-l-2 border-primary/30 ml-4 pl-6 space-y-8 my-4">
          <div
            v-for="evt in events"
            :key="evt.id"
            class="relative group"
          >
            <!-- Kruh na časovej osi -->
            <div
              class="absolute -left-7.75 top-1 size-4 rounded-full bg-primary border-4 border-background group-hover:scale-125 transition shadow-sm"
            />

            <!-- Karta udalosti -->
            <div class="p-4 rounded-xl border border-default bg-default space-y-2 hover:border-primary/40 transition">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {{ evt.date ? evt.date + ' · ' : '' }}{{ evt.time || 'Neznámy čas' }}
                  </span>
                  <h4 class="font-bold text-sm text-foreground">
                    {{ evt.title }}
                  </h4>
                </div>
                <UBadge variant="subtle" size="xs">
                  {{ evt.type || 'udalosť' }}
                </UBadge>
              </div>

              <p class="text-xs text-foreground/90">
                {{ evt.description }}
              </p>

              <!-- Citácia a miesto -->
              <div class="pt-2 border-t border-default/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <div v-if="evt.location" class="flex items-center gap-1 text-primary">
                  <UIcon name="i-lucide-map-pin" class="size-3.5" />
                  <span>{{ evt.location }}</span>
                </div>
                <div v-if="evt.persons?.length" class="flex items-center gap-1">
                  <UIcon name="i-lucide-users" class="size-3.5" />
                  <span>{{ evt.persons.join(', ') }}</span>
                </div>
                <div v-if="evt.source_quote" class="w-full text-xs italic text-muted/80 bg-elevated/30 p-2 rounded">
                  „{{ evt.source_quote }}“
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
