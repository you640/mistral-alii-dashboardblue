<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useVault } from '~/composables/useVault'

const route = useRoute()
const { isUnlocked } = useVault()
const vaultModalOpen = ref(false)

useDashboard()

const links = [[{
  label: 'Prehľad',
  icon: 'i-lucide-layout-dashboard',
  to: '/'
}, {
  label: 'Spisy',
  icon: 'i-lucide-file-text',
  to: '/documents'
}, {
  label: 'Osoby',
  icon: 'i-lucide-users',
  to: '/persons'
}, {
  label: 'Rozpory',
  icon: 'i-lucide-alert-triangle',
  to: '/contradictions'
}, {
  label: 'Graf vzťahov',
  icon: 'i-lucide-share-2',
  to: '/graph'
}, {
  label: 'Časová os',
  icon: 'i-lucide-clock',
  to: '/timeline'
}], [{
  label: 'Pripojiť AI (MCP)',
  icon: 'i-lucide-cable',
  to: '/connect'
}, {
  label: 'Nastavenia',
  icon: 'i-lucide-settings',
  to: '/settings'
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Navigácia',
  items: links.flat()
}, {
  id: 'code',
  label: 'Kód',
  items: [{
    id: 'source',
    label: 'Zobraziť zdrojový kód',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2 px-2 py-1.5">
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500 text-white font-bold text-sm"
          >
            A
          </div>
          <span v-if="!collapsed" class="font-semibold text-sm truncate">Alibi Platform</span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />

        <!-- Zero-Knowledge Trezor Tlačidlo -->
        <div class="p-2 pt-0">
          <UButton
            :icon="isUnlocked ? 'i-lucide-lock-open' : 'i-lucide-shield'"
            :label="collapsed ? undefined : (isUnlocked ? 'Trezor odomknutý' : 'Odomknúť trezor')"
            :color="isUnlocked ? 'success' : 'warning'"
            variant="subtle"
            size="xs"
            class="w-full justify-start"
            @click="vaultModalOpen = true"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <!-- Zero-Knowledge Trezor Modal -->
    <VaultUnlockModal v-model:open="vaultModalOpen" />

    <slot />
  </UDashboardGroup>
</template>
