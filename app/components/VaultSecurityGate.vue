<script setup lang="ts">
import { useVault } from '~/composables/useVault'

const { isUnlocked, unlock } = useVault()
const pin = ref('')
const error = ref(false)
const isSubmitting = ref(false)

const REQUIRED_PIN = '2366'

function handleKeyPress(num: string) {
  if (pin.value.length < 4) {
    pin.value += num
    if (pin.value.length === 4) {
      submitPin()
    }
  }
}

function handleBackspace() {
  if (pin.value.length > 0) {
    pin.value = pin.value.slice(0, -1)
    error.value = false
  }
}

async function submitPin() {
  if (pin.value === REQUIRED_PIN) {
    isSubmitting.value = true
    error.value = false
    await unlock(pin.value)
    isSubmitting.value = false
  } else {
    error.value = true
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(200)
    }
    setTimeout(() => {
      pin.value = ''
      error.value = false
    }, 1000)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (isUnlocked.value) return
  if (e.key >= '0' && e.key <= '9') {
    handleKeyPress(e.key)
  } else if (e.key === 'Backspace') {
    handleBackspace()
  } else if (e.key === 'Enter' && pin.value.length === 4) {
    submitPin()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="!isUnlocked"
      class="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl select-none p-4"
      style="height: 100dvh;"
    >
      <div class="max-w-xs w-full text-center space-y-6">
        <!-- Logo a štít -->
        <div class="space-y-3">
          <div class="relative mx-auto size-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-2xl shadow-amber-500/20">
            <div class="flex size-full items-center justify-center rounded-[14px] bg-slate-950">
              <UIcon name="i-lucide-shield-alert" class="size-8 text-amber-400 animate-pulse" />
            </div>
          </div>
          <h2 class="text-xl font-bold tracking-tight text-white">
            Bezpečnostný Trezor Alibi
          </h2>
          <p class="text-xs text-slate-400">
            Pre prístup k vyšetrovacím spisom a funkciám zadajte bezpečnostný PIN.
          </p>
        </div>

        <!-- 4-bodkový PIN indikátor -->
        <div class="flex justify-center items-center gap-4 py-2">
          <div
            v-for="i in 4"
            :key="i"
            class="size-4 rounded-full border-2 transition-all duration-200"
            :class="[
              error
                ? 'border-rose-500 bg-rose-500 animate-shake'
                : pin.length >= i
                  ? 'border-amber-400 bg-amber-400 scale-110 shadow-lg shadow-amber-400/50'
                  : 'border-slate-700 bg-slate-900/50'
            ]"
          />
        </div>

        <div v-if="error" class="text-xs font-semibold text-rose-400 animate-bounce">
          Nesprávny PIN kód! Skúste znova.
        </div>

        <!-- Numerická klávesnica (Keypad) -->
        <div class="grid grid-cols-3 gap-3 pt-2">
          <button
            v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
            :key="n"
            type="button"
            class="h-14 rounded-2xl bg-slate-900/80 border border-slate-800 text-xl font-bold text-slate-100 hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-black/40"
            @click="handleKeyPress(n)"
          >
            {{ n }}
          </button>

          <!-- Prázdne miesto / Reset -->
          <button
            type="button"
            class="h-14 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-300 flex items-center justify-center transition-colors"
            @click="pin = ''"
          >
            Zmazať
          </button>

          <!-- 0 -->
          <button
            type="button"
            class="h-14 rounded-2xl bg-slate-900/80 border border-slate-800 text-xl font-bold text-slate-100 hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-black/40"
            @click="handleKeyPress('0')"
          >
            0
          </button>

          <!-- Backspace -->
          <button
            type="button"
            class="h-14 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center shadow-md shadow-black/40"
            @click="handleBackspace"
          >
            <UIcon name="i-lucide-delete" class="size-6" />
          </button>
        </div>

        <div class="pt-2 text-[11px] text-slate-500">
          Tip pre vyšetrovateľa: Predvolený PIN je <span class="font-mono font-bold text-amber-400/90">2366</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
