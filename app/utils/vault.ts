const PBKDF2_ITERATIONS = 150000
const PREFIX = 'ENC1::'

/**
 * Odvodenie AES-GCM 256-bit CryptoKey z hesla pomocou PBKDF2 (SHA-256)
 */
export async function deriveKeyFromPassphrase(passphrase: string, saltString: string = 'AlibiForensicVaultSalt'): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const salt = enc.encode(saltString)

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Šifrovanie textu cez AES-GCM 256-bit
 * Vracia reťazec vo formáte ENC1::<base64_iv>::<base64_ciphertext>
 */
export async function encryptText(plaintext: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder()
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    enc.encode(plaintext)
  )

  const ivBase64 = btoa(String.fromCharCode(...iv))
  const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)))

  return `${PREFIX}${ivBase64}::${cipherBase64}`
}

/**
 * Dešifrovanie textu cez AES-GCM 256-bit
 */
export async function decryptText(encryptedString: string, key: CryptoKey): Promise<string> {
  if (!isEncrypted(encryptedString)) {
    return encryptedString
  }

  const parts = encryptedString.slice(PREFIX.length).split('::')
  if (parts.length !== 2) {
    throw new Error('Neplatný formát zašifrovaných dát')
  }

  const ivBytes = Uint8Array.from(atob(parts[0]!), c => c.charCodeAt(0))
  const cipherBytes = Uint8Array.from(atob(parts[1]!), c => c.charCodeAt(0))

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes
    },
    key,
    cipherBytes
  )

  const dec = new TextDecoder()
  return dec.decode(decryptedBuffer)
}

/**
 * Zistenie či je reťazec zašifrovaný trezorom
 */
export function isEncrypted(str: string | null | undefined): boolean {
  if (!str || typeof str !== 'string') return false
  return str.startsWith(PREFIX)
}
