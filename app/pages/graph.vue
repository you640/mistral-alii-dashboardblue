<script setup lang="ts">
import { useForenzStore } from '~/stores/forenzStore'

const store = useForenzStore()

const selectedNode = ref<any>(null)

const nodes = computed(() => store.graphNodes)
const edges = computed(() => store.graphEdges)

// Simulované pozície pre SVG vizualizáciu
const nodePositions = computed(() => {
  const count = nodes.value.length
  if (count === 0) return []

  const centerX = 350
  const centerY = 220
  const radius = Math.min(180, 50 + count * 25)

  return nodes.value.map((node, index) => {
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    return { ...node, x, y }
  })
})

function getNodePos(id: string) {
  return nodePositions.value.find(n => n.id === id || n.label === id) || { x: 350, y: 220 }
}
</script>

<template>
  <UDashboardPanel id="graph">
    <template #header>
      <UDashboardNavbar title="Graf Vzťahov & Siete Kontaktov">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="subtle">
              {{ nodes.length }} Uzlov (Osoby)
            </UBadge>
            <UBadge color="neutral" variant="subtle">
              {{ edges.length }} Hrany (Vzťahy)
            </UBadge>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-4">
        <!-- Prázdny stav -->
        <div v-if="nodes.length === 0" class="text-center py-20 border border-dashed border-default rounded-xl">
          <UIcon name="i-lucide-share-2" class="size-12 text-muted mx-auto mb-2 opacity-50" />
          <h3 class="font-semibold text-base mb-1">
            Žiadne prepojenia na zobrazenie
          </h3>
          <p class="text-sm text-muted max-w-sm mx-auto mb-4">
            Načítajte spisy s výpoveďami a osobami pre vygenerovanie interaktívneho sociálneho grafu.
          </p>
          <UButton label="Nahrať spis" to="/documents" icon="i-lucide-upload" size="sm" />
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Canvas / SVG plocha grafu -->
          <div class="lg:col-span-2 p-4 rounded-xl border border-default bg-default/50 flex flex-col items-center justify-center min-h-115 relative overflow-hidden">
            <svg class="w-full h-110 select-none" viewBox="0 0 700 440">
              <defs>
                <!-- Šípka pre orientované hrany -->
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="16" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
                </marker>
              </defs>

              <!-- Spojovacie hrany -->
              <g v-for="edge in edges" :key="edge.source + '-' + edge.target">
                <line
                  :x1="getNodePos(edge.source).x"
                  :y1="getNodePos(edge.source).y"
                  :x2="getNodePos(edge.target).x"
                  :y2="getNodePos(edge.target).y"
                  stroke="#475569"
                  stroke-width="2"
                  stroke-dasharray="4 2"
                  marker-end="url(#arrowhead)"
                />
                <text
                  :x="(getNodePos(edge.source).x + getNodePos(edge.target).x) / 2"
                  :y="(getNodePos(edge.source).y + getNodePos(edge.target).y) / 2 - 6"
                  text-anchor="middle"
                  fill="#94a3b8"
                  font-size="10"
                  class="font-medium"
                >
                  {{ edge.label || 'kontakt' }}
                </text>
              </g>

              <!-- Uzly osôb -->
              <g
                v-for="node in nodePositions"
                :key="node.id"
                class="cursor-pointer transition-transform duration-200 hover:scale-110"
                @click="selectedNode = node"
              >
                <circle
                  :cx="node.x"
                  :cy="node.y"
                  :r="selectedNode?.id === node.id ? 26 : 22"
                  :fill="node.color || '#3b82f6'"
                  :stroke="selectedNode?.id === node.id ? '#ffffff' : '#1e293b'"
                  stroke-width="3"
                />
                <text
                  :x="node.x"
                  :y="node.y + 4"
                  text-anchor="middle"
                  fill="#ffffff"
                  font-size="12"
                  font-weight="bold"
                >
                  {{ (node.label || 'O').charAt(0) }}
                </text>
                <text
                  :x="node.x"
                  :y="node.y + 36"
                  text-anchor="middle"
                  fill="#cbd5e1"
                  font-size="11"
                  font-weight="600"
                >
                  {{ node.label }}
                </text>
              </g>
            </svg>

            <div class="absolute bottom-3 left-3 text-xs text-muted bg-background/80 px-2 py-1 rounded border border-default/40">
              💡 Kliknite na uzol pre zobrazenie detailov osoby a jej väzieb.
            </div>
          </div>

          <!-- Bočný panel detailov vybraného uzla -->
          <div class="p-5 rounded-xl border border-default bg-default space-y-4">
            <h3 class="font-semibold text-sm uppercase tracking-wider text-muted flex items-center gap-2">
              <UIcon name="i-lucide-user-check" class="size-4 text-primary" />
              Detail vybraného uzla
            </h3>

            <div v-if="selectedNode" class="space-y-3">
              <div class="flex items-center gap-3">
                <div
                  class="size-10 rounded-full flex items-center justify-center font-bold text-white shadow"
                  :style="{ backgroundColor: selectedNode.color || '#3b82f6' }"
                >
                  {{ (selectedNode.label || 'O').charAt(0) }}
                </div>
                <div>
                  <h4 class="font-bold text-base">
                    {{ selectedNode.label }}
                  </h4>
                  <UBadge variant="subtle" size="xs">
                    {{ selectedNode.type }}
                  </UBadge>
                </div>
              </div>

              <div class="p-3 bg-elevated/40 rounded-lg border border-default/50 space-y-1">
                <div class="text-xs text-muted font-medium">
                  Profil & Kontext:
                </div>
                <p class="text-xs text-foreground/90">
                  {{ selectedNode.details || 'Bez dodatočného popisu.' }}
                </p>
              </div>

              <div class="space-y-2 pt-2 border-t border-default/50">
                <div class="text-xs font-semibold text-muted">
                  Súvisiace vzťahy:
                </div>
                <div
                  v-for="e in edges.filter(ed => ed.source === selectedNode.id || ed.target === selectedNode.id)"
                  :key="e.source + '-' + e.target"
                  class="text-xs p-2 rounded bg-default/80 border border-default/40"
                >
                  <span class="font-medium text-primary">{{ e.label }}</span>: {{ e.description || e.time }}
                </div>
              </div>
            </div>

            <div v-else class="text-center py-16 text-muted text-xs">
              Vyberte osobu na grafe pre zobrazenie forenzného profilu a prepojení.
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
