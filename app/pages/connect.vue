<script setup lang="ts">
const config = useRuntimeConfig()
const toast = useToast()

const serverUrl = computed(() => {
  return config.public.mcpUrl || 'https://alibi-case-core.base44.app/api/mcp'
})

const active = ref('claude')
const copied = ref(false)

const CLIENTS = [
  {
    id: 'claude',
    label: 'Claude',
    icon: 'i-lucide-bot',
    steps: [
      'Otvorte profilové menu (pravý horný roh) a vyberte Settings.',
      'Prejdite na Connectors → „Add custom connector".',
      'Pomenujte connector (napr. „Alibi Forenzná") a vložte URL serveru nižšie.',
      'Kliknite Add — Claude vás presmeruje na prihlasovaciu obrazovku aplikácie.'
    ]
  },
  {
    id: 'antigravity',
    label: 'Antigravity IDE',
    icon: 'i-lucide-sparkles',
    steps: [
      'Otvorte konfiguráciu MCP serverov (C:\\Users\\42195\\.gemini\\config\\mcp_config.json).',
      'Pridajte záznam pre „alibi-case-core" s URL servera.',
      'Uložte súbor a Antigravity IDE automaticky načíta všetkých 11 entít a 5 AI nástrojov.',
      'Pri prvom dopyte potvrďte OAuth autorizáciu v prehliadači.'
    ]
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    icon: 'i-lucide-message-square',
    steps: [
      'V nastaveniach otvorte Apps a zapnite Developer mode (potvrďte upozornenie, ktoré ChatGPT zobrazí).',
      'Kliknite na „Create app", pomenujte ho a vložte URL serveru nižšie.',
      'Vytvorte app, potom ho povoľte z panela v chat composeri pred zadávaním otázok.'
    ]
  },
  {
    id: 'cursor',
    label: 'Cursor',
    icon: 'i-lucide-mouse-pointer-click',
    steps: [
      'Otvorte Settings → Tools & Integrations → „New MCP Server".',
      'Otvorí sa mcp.json — pridajte záznam s kľúčom url nastaveným na URL serveru nižšie.',
      'Uložte súbor a zapnite nový server prepínačom.'
    ]
  },
  {
    id: 'custom',
    label: 'Vlastný MCP Klient',
    icon: 'i-lucide-code-2',
    steps: [
      'Skopírujte URL serveru nižšie a pridajte ho ako streamable HTTP MCP server.',
      'Väčšina klientov potrebuje len názov + URL; po pridaní reštartujte/načítajte klienta.'
    ]
  }
]

const currentClient = computed(() => CLIENTS.find(c => c.id === active.value) || CLIENTS[0]!)

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(serverUrl.value)
    copied.value = true
    toast.add({
      title: 'Skopírované do schránky',
      description: 'URL MCP servera bola úspešne skopírovaná.',
      color: 'success'
    })
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.warn('Kopírovanie zlyhalo:', err)
  }
}
</script>

<template>
  <UDashboardPanel id="connect-panel">
    <template #header>
      <UDashboardNavbar title="Pripojiť AI Asistenta (MCP)" :badge="serverUrl">
        <template #leading>
          <DashboardSidebarToggle />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="p-5 lg:p-8 max-w-4xl mx-auto space-y-6">
      <!-- Hlavička / Hero Karta -->
      <div class="p-6 rounded-2xl border border-default bg-elevated/40 backdrop-blur-xl space-y-3 shadow-lg">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <UIcon name="i-lucide-cable" class="size-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground">
              Pripojiť AI Asistenta (Model Context Protocol)
            </h1>
            <p class="text-xs text-muted">
              Nasměrujte Antigravity, Claude, ChatGPT, Cursor alebo iný MCP klient na tento forenzný server.
            </p>
          </div>
        </div>
      </div>

      <!-- URL MCP Servera -->
      <div class="p-5 rounded-2xl border border-default bg-elevated/20 backdrop-blur-md space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-primary">
            URL MCP Servera
          </span>
          <span class="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live OAuth Endpoint
          </span>
        </div>

        <div class="flex items-center gap-2">
          <code class="flex-1 rounded-xl px-4 py-3 text-xs font-mono text-foreground bg-slate-950/80 border border-slate-800 break-all select-all">
            {{ serverUrl }}
          </code>
          <UButton
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            :label="copied ? 'Skopírované' : 'Kopírovať'"
            :color="copied ? 'success' : 'primary'"
            variant="solid"
            size="sm"
            @click="copyUrl"
          />
        </div>
      </div>

      <!-- Klientske Záložky (Tabs) -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="c in CLIENTS"
          :key="c.id"
          type="button"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border"
          :class="[
            active === c.id
              ? 'bg-primary/10 border-primary/40 text-primary shadow-sm shadow-primary/20'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          ]"
          @click="active = c.id"
        >
          <UIcon :name="c.icon" class="size-4" />
          {{ c.label }}
        </button>
      </div>

      <!-- Kroky Pre Vybraného Klienta -->
      <div class="p-6 rounded-2xl border border-default bg-elevated/30 backdrop-blur-md space-y-6">
        <div class="flex items-center gap-2 text-sm font-semibold text-foreground">
          <UIcon :name="currentClient.icon" class="size-5 text-primary" />
          Ako pripojiť {{ currentClient.label }}
        </div>

        <ol class="space-y-4">
          <li
            v-for="(step, i) in currentClient.steps"
            :key="i"
            class="flex items-start gap-3.5"
          >
            <span class="size-6 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-xs font-mono font-bold text-primary shrink-0 mt-0.5">
              {{ i + 1 }}
            </span>
            <p class="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {{ step }}
            </p>
          </li>

          <!-- Bezpečnostné Upozornenie -->
          <li class="flex items-start gap-3.5 pt-2">
            <span class="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <UIcon name="i-lucide-shield-check" class="size-3.5 text-emerald-400" />
            </span>
            <p class="text-xs sm:text-sm text-muted leading-relaxed">
              Keďže server vyžaduje prihlásenie, klient otvorí súhlasnú stránku aplikácie —
              prihláste sa vlastným účtom a schválte prístup. Asistent koná výhradne vo vašom mene.
            </p>
          </li>
        </ol>

        <div class="rounded-xl border border-default bg-slate-950/60 p-4 flex items-start gap-3 text-xs text-muted">
          <UIcon name="i-lucide-refresh-cw" class="size-4 text-primary shrink-0 mt-0.5 animate-spin-slow" />
          <p>
            Po publikovaní zmien v aplikácii obnovte connector v klientovi — asistenti si
            cachujú zoznam nástrojov a treba ich znova načítať.
          </p>
        </div>
      </div>
    </div>
  </UDashboardPanel>
</template>
