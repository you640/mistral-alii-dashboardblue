import {
  deriveKeyFromPassphrase,
  encryptText,
  decryptText,
  isEncrypted
} from '~/utils/vault'

const isVaultUnlocked = ref(false)
let vaultCryptoKey: CryptoKey | null = null

export function useVault() {
  const toast = useToast()

  async function unlock(passphrase: string): Promise<boolean> {
    if (!passphrase || passphrase.trim().length < 4) {
      toast.add({
        title: 'Neplatné heslo',
        description: 'Heslo trezoru musí mať aspoň 4 znaky.',
        color: 'error'
      })
      return false
    }

    try {
      vaultCryptoKey = await deriveKeyFromPassphrase(passphrase)
      isVaultUnlocked.value = true
      toast.add({
        title: 'Trezor odomknutý',
        description: 'Zero-Knowledge šifrovanie je aktívne.',
        color: 'success'
      })
      return true
    } catch (err: any) {
      toast.add({
        title: 'Odomknutie zlyhalo',
        description: err.message || 'Nepodarilo sa odvodiť šifrovací kľúč.',
        color: 'error'
      })
      return false
    }
  }

  function lock() {
    vaultCryptoKey = null
    isVaultUnlocked.value = false
    toast.add({
      title: 'Trezor uzamknutý',
      description: 'Šifrovacie kľúče boli odstránené z pamäte.',
      color: 'neutral'
    })
  }

  async function encrypt(plaintext: string): Promise<string> {
    if (!isVaultUnlocked.value || !vaultCryptoKey) {
      // Ak trezor nie je odomknutý, vraciame pôvodný text (alebo throw)
      return plaintext
    }
    return await encryptText(plaintext, vaultCryptoKey)
  }

  async function decrypt(cipherOrPlain: string): Promise<string> {
    if (!isEncrypted(cipherOrPlain)) {
      return cipherOrPlain
    }
    if (!isVaultUnlocked.value || !vaultCryptoKey) {
      return '[Zašifrovaný obsah — odomknite trezor pre zobrazenie]'
    }
    return await decryptText(cipherOrPlain, vaultCryptoKey)
  }

  return {
    isUnlocked: isVaultUnlocked,
    unlock,
    lock,
    encrypt,
    decrypt,
    isEncrypted
  }
}
