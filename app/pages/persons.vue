<script setup lang="ts">
import { useForenzStore } from '~/stores/forenzStore'
import type { PersonType } from '~/types'

const store = useForenzStore()
const toast = useToast()

const searchQuery = ref('')
const selectedRole = ref<string>('all')

const roles: { label: string; value: string; color: string }[] = [
  { label: 'Všetci', value: 'all', color: 'neutral' },
  { label: 'Podozriví', value: 'podozrivý', color: 'error' },
  { label: 'Svedkovia', value: 'svedok', color: 'info' },
  { label: 'Alibi kontakty', value: 'alibi', color: 'success' },
  { label: 'Obete', value: 'obeť', color: 'warning' }
]

const filteredPersons = computed(() => {
  return store.persons.filter(p => {
    const matchesSearch = !searchQuery.value ||
      (p.name && p.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (p.details && p.details.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesRole = selectedRole.value === 'all' || p.type === selectedRole.value
    return matchesSearch && matchesRole
  })
})

function getRoleBadgeColor(type: PersonType | string) {
  switch (type) {
    case 'podozrivý': return 'error'
    case 'svedok': return 'info'
    case 'alibi': return 'success'
    case 'obeť': return 'warning'
    default: return 'neutral'
  }
}

function removePerson(id: string) {
  store.persons = store.persons.filter(p => p.id !== id)
  store.saveToLocalStorage()
  toast.add({ title: 'Osoba odstránená zo spisu', color: 'neutral' })
}
</script>

<template>
  <UDashboardPanel id="persons">
    <template #header>
      <UDashboardNavbar title="Evidencia Osôb">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Hľadať osobu..."
            class="w-48 sm:w-64"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-6">
        <!-- Filter podľa rolí -->
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="r in roles"
            :key="r.value"
            :label="r.label"
            :variant="selectedRole === r.value ? 'solid' : 'outline'"
            :color="selectedRole === r.value ? 'primary' : 'neutral'"
            size="sm"
            @click="selectedRole = r.value"
          />
        </div>

        <!-- Prázdny stav -->
        <div v-if="filteredPersons.length === 0" class="text-center py-16 border border-dashed border-default rounded-xl">
          <UIcon name="i-lucide-user-x" class="size-10 text-muted mx-auto mb-2 opacity-50" />
          <h3 class="font-semibold text-base mb-1">Žiadne osoby</h3>
          <p class="text-sm text-muted max-w-sm mx-auto mb-4">
            Nahrajte výpovede v sekcii Spisy alebo načítajte ukážkový prípad pre extrakciu profilov.
          </p>
          <UButton label="Prejsť na Spisy" to="/documents" icon="i-lucide-file-text" size="sm" />
        </div>

        <!-- Grid kariet osôb -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="person in filteredPersons"
            :key="person.id"
            class="p-4 rounded-xl border border-default bg-default flex flex-col justify-between space-y-3 hover:border-primary/50 transition shadow-sm"
          >
            <div>
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <div
                    class="size-8 rounded-full flex items-center justify-center font-bold text-xs"
                    :class="person.type === 'podozrivý' ? 'bg-rose-500/20 text-rose-500' : person.type === 'svedok' ? 'bg-blue-500/20 text-blue-500' : person.type === 'alibi' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'"
                  >
                    {{ (person.name || 'O').charAt(0) }}
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm leading-tight">{{ person.name }}</h4>
                    <span class="text-xs text-muted">{{ person.document_title || 'Nezaradený spis' }}</span>
                  </div>
                </div>
                <UBadge
                  :color="getRoleBadgeColor(person.type)"
                  variant="subtle"
                  size="xs"
                >
                  {{ person.type }}
                </UBadge>
              </div>

              <p class="text-xs text-muted mt-3 line-clamp-3 bg-elevated/40 p-2.5 rounded-lg border border-default/50">
                {{ person.details || 'Bez dodatočných profilových detailov.' }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-default/50 text-xs text-muted">
              <div class="flex items-center gap-1.5">
                <span v-if="person.isKeyHub" class="text-amber-500 font-semibold flex items-center gap-1">
                  <UIcon name="i-lucide-flame" class="size-3.5" /> Kľúčový uzol
                </span>
                <span v-else>Vzťahy: {{ person.degree || 0 }}</span>
              </div>
              <UButton
                icon="i-lucide-trash-2"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="removePerson(person.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
