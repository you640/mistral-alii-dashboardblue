<script setup lang="ts">
import { useVault } from '~/composables/useVault'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { isUnlocked, unlock, lock } = useVault()
const passphrase = ref('')
const isProcessing = ref(false)

async function handleUnlock() {
  if (!passphrase.value) return
  isProcessing.value = true
  const success = await unlock(passphrase.value)
  isProcessing.value = false
  if (success) {
    passphrase.value = ''
    emit('update:open', false)
  }
}

function handleLock() {
  lock()
  emit('update:open', false)
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="p-6 space-y-5 bg-default/95 backdrop-blur-xl rounded-2xl border border-default">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                :class="isUnlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'"
              >
                <UIcon :name="isUnlocked ? 'i-lucide-lock-open' : 'i-lucide-shield-check'" class="size-3.5" />
                {{ isUnlocked ? 'Trezor Odomknutý' : 'Zero-Knowledge Trezor' }}
              </span>
            </div>
            <h3 class="text-lg font-bold text-foreground">
              {{ isUnlocked ? 'Správa Forenzného Trezoru' : 'Odomknúť Forenzný Trezor' }}
            </h3>
            <p class="text-xs text-muted">
              {{ isUnlocked ? 'Dáta sa v reálnom čase šifrujú on-device cez AES-GCM 256-bit.' : 'Zadajte heslo pre lokálne odvodenie dešifrovacieho kľúča (PBKDF2).' }}
            </p>
          </div>

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="emit('update:open', false)"
          />
        </div>

        <div v-if="!isUnlocked" class="space-y-3">
          <UFormField label="Heslo trezoru">
            <UInput
              v-model="passphrase"
              type="password"
              placeholder="Zadajte silné heslo..."
              icon="i-lucide-key"
              class="w-full"
              @keydown.enter="handleUnlock"
            />
          </UFormField>

          <p class="text-[11px] text-muted">
            ⚠️ Heslo sa <strong>nikdy neposiela na server</strong> ani do Base44. Zostáva iba v RAM pamäti tohto prehliadača.
          </p>

          <div class="flex items-center gap-3 pt-2">
            <UButton
              label="Odomknúť trezor"
              color="primary"
              icon="i-lucide-lock-open"
              class="flex-1 justify-center"
              :loading="isProcessing"
              @click="handleUnlock"
            />
            <UButton
              label="Zrušiť"
              color="neutral"
              variant="ghost"
              @click="emit('update:open', false)"
            />
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-300 space-y-1">
            <p class="font-semibold">Aktívny stav: Odomknutý</p>
            <p class="text-muted">Všetky novonahrané dokumenty sú automaticky šifrované pred odoslaním do cloudu.</p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <UButton
              label="Uzamknúť trezor"
              color="error"
              variant="subtle"
              icon="i-lucide-lock"
              class="flex-1 justify-center"
              @click="handleLock"
            />
            <UButton
              label="Zavrieť"
              color="neutral"
              variant="ghost"
              @click="emit('update:open', false)"
            />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
