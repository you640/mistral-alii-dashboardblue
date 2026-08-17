<script setup lang="ts">
import { useForenzStore } from '~/stores/forenzStore'

const store = useForenzStore()
const toast = useToast()

const appId = ref('6a81f5e7f4adbf6a9523b9d8')
const apiKey = ref('')
const mistralApiKey = ref('')
const isExporting = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined') {
    appId.value = localStorage.getItem('base44_app_id') || appId.value
    apiKey.value = localStorage.getItem('base44_api_key') || ''
    mistralApiKey.value = localStorage.getItem('mistral_api_key') || ''
  }
})

function handleSaveBase44() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('base44_app_id', appId.value)
    localStorage.setItem('base44_api_key', apiKey.value)
    toast.add({ title: 'Base44 konfigurácia uložená', color: 'success' })
  }
}

function handleSaveMistral() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mistral_api_key', mistralApiKey.value)
    toast.add({ title: 'Mistral API kľúč uložený', color: 'success' })
  }
}

function handleExportDossier() {
  isExporting.value = true
  try {
    const data = store.exportState()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forenzny_spis_audit_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.add({ title: 'Súdny spis úspešne exportovaný', color: 'success' })
  } catch (err: any) {
    toast.add({ title: 'Chyba pri exporte', description: err.message, color: 'error' })
  } finally {
    isExporting.value = false
  }
}

function handleResetAll() {
  if (confirm('Naozaj chcete vymazať všetky dáta a spisy v aplikácii?')) {
    store.clearAll()
    store.saveToLocalStorage()
    toast.add({ title: 'Všetky dáta boli vymazané', color: 'neutral' })
  }
}
</script>

<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar title="Nastavenia & API Konfigurácia">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-6 max-w-3xl">
        <!-- Konfigurácia Mistral AI / Pixtral -->
        <div class="p-5 rounded-xl border border-default bg-default space-y-4">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <UIcon name="i-lucide-sparkles" class="size-5" />
            </div>
            <div>
              <h3 class="font-semibold text-base">Mistral AI & Pixtral Vision API</h3>
              <p class="text-xs text-muted">API kľúč pre analýzu výpovedí, OCR fotografií a extrakciu entít.</p>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <div>
              <label class="text-xs font-semibold text-muted block mb-1">MISTRAL_API_KEY</label>
              <UInput
                v-model="mistralApiKey"
                type="password"
                placeholder="Zadajte váš Mistral API kľúč..."
                icon="i-lucide-key"
              />
              <span class="text-[10px] text-muted mt-1 block">
                Používa modely <code>mistral-large-latest</code> (text) a <code>pixtral-12b-2409</code> (skeny / fotografie).
              </span>
            </div>
          </div>
        </div>

        <!-- Konfigurácia Base44 Backend -->
        <div class="p-5 rounded-xl border border-default bg-default space-y-4">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <UIcon name="i-lucide-database" class="size-5" />
            </div>
            <div>
              <h3 class="font-semibold text-base">Base44 Backend SDK</h3>
              <p class="text-xs text-muted">Nastavenie pripojenia pre ukladanie a synchronizáciu entít.</p>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <div>
              <label class="text-xs font-semibold text-muted block mb-1">Base44 App ID</label>
              <UInput v-model="appId" placeholder="App ID" />
            </div>
            <div>
              <label class="text-xs font-semibold text-muted block mb-1">Base44 API Key (voliteľné)</label>
              <UInput v-model="apiKey" type="password" placeholder="••••••••••••••••" />
            </div>
            <UButton
              label="Uložiť všetky nastavenia"
              color="primary"
              size="sm"
              @click="handleSaveSettings"
            />
          </div>
        </div>

        <!-- Export a Audit Súdneho Spisu -->
        <div class="p-5 rounded-xl border border-default bg-default space-y-4">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <UIcon name="i-lucide-file-archive" class="size-5" />
            </div>
            <div>
              <h3 class="font-semibold text-base">Export Súdneho Dossier</h3>
              <p class="text-xs text-muted">Generovanie auditného balíka s reťazcom dôkazov a časovými záznamami.</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            <UButton
              icon="i-lucide-download"
              label="Stiahnuť Forenzný Spis (JSON Audit)"
              color="primary"
              :loading="isExporting"
              @click="handleExportDossier"
            />
          </div>
        </div>

        <!-- Reset Dát -->
        <div class="p-5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
          <h3 class="font-semibold text-base text-rose-400">Nebezpečná zóna</h3>
          <p class="text-xs text-muted">Vymazanie všetkých nahraných výpovedí, osôb a detekovaných rozporov z lokálnej pamäte.</p>
          <UButton
            icon="i-lucide-trash-2"
            label="Vymazať celú databázu"
            color="error"
            variant="solid"
            size="sm"
            @click="handleResetAll"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
