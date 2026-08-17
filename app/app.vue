<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'sk'
  }
})

const title = 'Alibi — AI Forenzná Platforma'
const description = 'AI-powered forenzná analýza výpovedí, detekcia rozporov, alibi verifikácia a vizualizácia vzťahov. Postavené na Nuxt 4 a Base44.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <!-- Globálny Bezpečnostný Zámok Trezoru (PIN 2366) -->
    <VaultSecurityGate />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
