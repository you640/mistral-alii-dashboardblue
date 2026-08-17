<script setup lang="ts">
import { useForenzStore } from '~/stores/forenzStore'
import { useAiAnalyzer } from '~/composables/useAiAnalyzer'
import { useBatchUploader } from '~/composables/useBatchUploader'
import { SAMPLE_CASE } from '~/utils/sampleData'

const store = useForenzStore()
const toast = useToast()
const { status: aiStatus, analyzeDocument } = useAiAnalyzer()
const batch = useBatchUploader()

const activeTab = ref<'batch' | 'single'>('batch')
const docTitle = ref('')
const docText = ref('')
const singleFile = ref<File | null>(null)
const singleFileDataUrl = ref<string | null>(null)
const isDragging = ref(false)
const selectedFilter = ref<'all' | 'done' | 'pending' | 'error'>('all')

const filteredDocuments = computed(() => {
  if (selectedFilter.value === 'all') return store.documents
  return store.documents.filter(d => d.status === selectedFilter.value)
})

function handleBatchFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    batch.addFilesToQueue(target.files)
    target.value = ''
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    batch.addFilesToQueue(event.dataTransfer.files)
  }
}

function handleSingleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    singleFile.value = file
    if (!docTitle.value) {
      docTitle.value = file.name.replace(/\.[^/.]+$/, '')
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        singleFileDataUrl.value = reader.result as string
      }
      reader.readAsDataURL(file)
    }
    else {
      const reader = new FileReader()
      reader.onload = () => {
        docText.value = reader.result as string
      }
      reader.readAsText(file)
    }
  }
}

async function handleStartSingleAnalysis() {
  if (!docTitle.value.trim()) {
    toast.add({ title: 'Chyba', description: 'Zadajte názov výpovede alebo dokumentu.', color: 'error' })
    return
  }

  if (!docText.value.trim() && !singleFileDataUrl.value) {
    toast.add({ title: 'Chyba', description: 'Vložte text výpovede alebo nahrajte súbor.', color: 'error' })
    return
  }

  const res = await analyzeDocument({
    title: docTitle.value.trim(),
    text: docText.value.trim(),
    imageDataUrl: singleFileDataUrl.value || undefined
  })

  if (res.ok) {
    docTitle.value = ''
    docText.value = ''
    singleFile.value = null
    singleFileDataUrl.value = null
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function handleLoadDemo() {
  store.importState(SAMPLE_CASE)
  store.saveToLocalStorage()
  toast.add({ title: 'Ukážková kauza načítaná', color: 'success' })
}

function removeDoc(id: string) {
  store.removeDocument(id)
  store.saveToLocalStorage()
  toast.add({ title: 'Spis odstránený', color: 'neutral' })
}
</script>

<template>
  <UDashboardPanel id="documents">
    <template #header>
      <UDashboardNavbar title="Spisy & Hromadný Import Dokumentov">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="subtle">
              {{ store.documents.length }} Spisov v databáze
            </UBadge>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-6">
        <!-- Rýchle štatistiky spisov -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            class="p-4 rounded-lg border border-default bg-default cursor-pointer transition"
            :class="{ 'ring-2 ring-primary': selectedFilter === 'all' }"
            @click="selectedFilter = 'all'"
          >
            <div class="text-xs text-muted font-medium">VŠETKY SPISY</div>
            <div class="text-2xl font-bold mt-1">{{ store.documents.length }}</div>
          </div>
          <div
            class="p-4 rounded-lg border border-default bg-default cursor-pointer transition"
            :class="{ 'ring-2 ring-primary': selectedFilter === 'done' }"
            @click="selectedFilter = 'done'"
          >
            <div class="text-xs text-muted font-medium">SPRACOVANÉ</div>
            <div class="text-2xl font-bold mt-1 text-emerald-500">{{ store.documentsByStatus.done?.length || 0 }}</div>
          </div>
          <div
            class="p-4 rounded-lg border border-default bg-default cursor-pointer transition"
            :class="{ 'ring-2 ring-primary': selectedFilter === 'pending' }"
            @click="selectedFilter = 'pending'"
          >
            <div class="text-xs text-muted font-medium">ČAKAJÚCE</div>
            <div class="text-2xl font-bold mt-1 text-amber-500">{{ store.documentsByStatus.pending?.length || 0 }}</div>
          </div>
          <div
            class="p-4 rounded-lg border border-default bg-default cursor-pointer transition"
            :class="{ 'ring-2 ring-primary': selectedFilter === 'error' }"
            @click="selectedFilter = 'error'"
          >
            <div class="text-xs text-muted font-medium">CHYBNÉ</div>
            <div class="text-2xl font-bold mt-1 text-rose-500">{{ store.documentsByStatus.error?.length || 0 }}</div>
          </div>
        </div>

        <!-- Prepínač medzi Hromadným Importom a Jednorazovou výpoveďou -->
        <div class="p-6 rounded-2xl border border-default bg-default/60 space-y-5 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <UButton
                icon="i-lucide-layers"
                label="Hromadný Import (PNG, JPG, PDF, TXT)"
                :variant="activeTab === 'batch' ? 'solid' : 'ghost'"
                :color="activeTab === 'batch' ? 'primary' : 'neutral'"
                size="sm"
                @click="activeTab = 'batch'"
              />
              <UButton
                icon="i-lucide-file-text"
                label="Jednotlivá Výpoveď (Text)"
                :variant="activeTab === 'single' ? 'solid' : 'ghost'"
                :color="activeTab === 'single' ? 'primary' : 'neutral'"
                size="sm"
                @click="activeTab = 'single'"
              />
            </div>
            <span class="text-xs text-muted flex items-center gap-1">
              <UIcon name="i-lucide-sparkles" class="size-4 text-primary" />
              Spracovanie cez Mistral AI / Pixtral 12B Vision
            </span>
          </div>

          <!-- === TAB 1: HROMADNÝ IMPORT (BATCH UPLOAD) === -->
          <div v-if="activeTab === 'batch'" class="space-y-4">
            <!-- Drag & Drop zóna pre viacero súborov naraz -->
            <div
              class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative bg-default/40"
              :class="isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-default hover:border-primary/50'"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                @change="handleBatchFileSelect"
              >
              <div class="flex flex-col items-center justify-center space-y-2">
                <div class="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <UIcon name="i-lucide-upload-cloud" class="size-7" />
                </div>
                <h4 class="font-bold text-base text-foreground">
                  Presuňte sem viacero súborov alebo kliknite pre výber
                </h4>
                <p class="text-xs text-muted max-w-md">
                  Podpora hromadného nahrávania: <span class="font-semibold text-foreground">PNG, JPG, PDF, TXT</span>.
                  Pixtral Vision vykoná OCR naskenovaných dokumentov a fotografií.
                </p>
                <div class="pt-2">
                  <UBadge variant="subtle" color="primary" size="sm">
                    Vyberte viacero súborov naraz (Ctrl + Click / Drag & Drop)
                  </UBadge>
                </div>
              </div>
            </div>

            <!-- Fronta hromadného importu (Queue Table) -->
            <div v-if="batch.queue.length > 0" class="p-4 rounded-xl border border-default bg-default space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 class="font-bold text-sm flex items-center gap-2">
                    <UIcon name="i-lucide-list-ordered" class="size-4 text-primary" />
                    Fronta súborov na analýzu ({{ batch.queue.length }})
                  </h4>
                  <p class="text-xs text-muted">
                    Pripravené na sekvenčnú forenznú extrakciu a krížovú kontrolu.
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <UButton
                    label="Vyčistiť frontu"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :disabled="batch.isProcessing"
                    @click="batch.clearQueue"
                  />
                  <UButton
                    icon="i-lucide-sparkles"
                    :label="batch.isProcessing ? 'Analyzuje sa...' : `Spustiť Hromadnú Analýzu (${batch.queue.length})`"
                    color="primary"
                    size="sm"
                    :loading="batch.isProcessing"
                    @click="batch.startBatchAnalysis"
                  />
                </div>
              </div>

              <!-- Celkový progress bar -->
              <div v-if="batch.isProcessing" class="space-y-1">
                <div class="flex justify-between text-xs font-semibold text-primary">
                  <span>Celkový postup hromadného importu</span>
                  <span>{{ batch.overallProgress }}%</span>
                </div>
                <div class="w-full bg-default/60 rounded-full h-2 overflow-hidden">
                  <div
                    class="bg-primary h-full transition-all duration-300 rounded-full"
                    :style="{ width: batch.overallProgress + '%' }"
                  />
                </div>
              </div>

              <!-- Zoznam položiek vo fronte -->
              <div class="divide-y divide-default/50 max-h-72 overflow-y-auto pr-1">
                <div
                  v-for="(item, idx) in batch.queue"
                  :key="item.id"
                  class="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <UIcon
                      :name="item.type === 'pdf' ? 'i-lucide-file-text' : item.type === 'image' ? 'i-lucide-image' : 'i-lucide-file-code'"
                      class="size-5 shrink-0"
                      :class="item.type === 'pdf' ? 'text-rose-500' : item.type === 'image' ? 'text-blue-500' : 'text-amber-500'"
                    />
                    <div class="truncate">
                      <span class="font-medium text-foreground truncate block">{{ item.name }}</span>
                      <span class="text-[10px] text-muted">{{ formatBytes(item.size) }} · {{ item.type.toUpperCase() }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 shrink-0">
                    <!-- Status Badge -->
                    <UBadge
                      :color="item.status === 'done' ? 'success' : item.status === 'processing' ? 'primary' : item.status === 'error' ? 'error' : 'neutral'"
                      variant="subtle"
                      size="xs"
                    >
                      <UIcon
                        v-if="item.status === 'processing'"
                        name="i-lucide-loader-2"
                        class="size-3 animate-spin mr-1 inline"
                      />
                      {{ item.status === 'done' ? 'Hotovo' : item.status === 'processing' ? 'Analyzuje sa' : item.status === 'error' ? 'Chyba' : 'V poradí' }}
                    </UBadge>

                    <UButton
                      icon="i-lucide-trash-2"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="batch.isProcessing"
                      @click="batch.removeItem(item.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- === TAB 2: JEDNOTLIVÁ VÝPOVEĎ (SINGLE) === -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-2 space-y-3">
                <UInput
                  v-model="docTitle"
                  placeholder="Názov dokumentu (napr. Výpoveď svedka - Peter Kováč)"
                  icon="i-lucide-file-text"
                />
                <UTextarea
                  v-model="docText"
                  placeholder="Vložte prepis výpovede, svedectva alebo zápisnice..."
                  :rows="4"
                />
              </div>

              <!-- Single File Upload -->
              <div class="flex flex-col items-center justify-center border-2 border-dashed border-default rounded-xl p-4 text-center hover:border-primary/50 transition cursor-pointer relative bg-default/40">
                <input
                  type="file"
                  accept=".txt,.pdf,image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  @change="handleSingleFileChange"
                >
                <UIcon name="i-lucide-upload" class="size-8 text-primary mb-1" />
                <span class="text-xs font-medium text-foreground">
                  {{ singleFile ? singleFile.name : 'Nahrajte jeden súbor / foto' }}
                </span>
                <span class="text-[10px] text-muted mt-0.5">TXT, PDF, JPG, PNG</span>
              </div>
            </div>

            <div class="flex items-center justify-end pt-2 border-t border-default/50">
              <UButton
                icon="i-lucide-sparkles"
                label="Spustiť AI Analýzu"
                color="primary"
                :loading="aiStatus.isAnalyzing"
                @click="handleStartSingleAnalysis"
              />
            </div>
          </div>
        </div>

        <!-- Zoznam evidovaných spisov -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted">
              Evidované spisy v databáze ({{ filteredDocuments.length }})
            </h3>
            <UButton
              label="Načítať ukážku (Demo)"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="handleLoadDemo"
            />
          </div>

          <div v-if="filteredDocuments.length === 0" class="text-center py-12 border border-dashed border-default rounded-xl">
            <UIcon name="i-lucide-files" class="size-10 text-muted mx-auto mb-2 opacity-50" />
            <p class="text-sm text-muted">Zatiaľ nie sú nahrané žiadne spisy. Použite hromadný import vyššie.</p>
          </div>

          <div
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="p-4 rounded-xl border border-default bg-default flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-file-text" class="size-5 text-primary shrink-0" />
                <span class="font-semibold text-sm truncate">{{ doc.title }}</span>
                <UBadge
                  :color="doc.status === 'done' ? 'success' : doc.status === 'error' ? 'error' : 'warning'"
                  variant="subtle"
                  size="xs"
                >
                  {{ doc.status }}
                </UBadge>
              </div>
              <p class="text-xs text-muted line-clamp-2 max-w-2xl">{{ doc.summary || 'Bez zhrnutia' }}</p>
              <div class="flex items-center gap-4 text-xs text-muted pt-1">
                <span>Osoby: {{ doc.person_count || 0 }}</span>
                <span>Vzťahy: {{ doc.relationship_count || 0 }}</span>
                <span v-if="doc.red_flag_count" class="text-rose-500 font-medium">Red flags: {{ doc.red_flag_count }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <UButton
                icon="i-lucide-trash-2"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="removeDoc(doc.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
