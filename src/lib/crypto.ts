// Password hashing using the Web Crypto API (available natively in Cloudflare
// Workers — no Node.js `crypto` module needed). Must stay in sync with the
// scheme used by /home/user/analysis/extract/gen_seed.js when generating the
// seed data's password hashes:
//   PBKDF2-HMAC-SHA256, 100000 iterations, 32-byte derived key,
//   salt + hash both base64-encoded.

const PBKDF2_ITERATIONS = 100_000
const PBKDF2_KEYLEN_BITS = 32 * 8 // 32 bytes
export const PASSWORD_ALGO = 'PBKDF2-SHA256-100000'

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export function randomSaltBase64(byteLen = 16): string {
  const bytes = new Uint8Array(byteLen)
  crypto.getRandomValues(bytes)
  return bufToBase64(bytes.buffer)
}

async function deriveKey(password: string, saltB64: string): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const saltBuf = base64ToBuf(saltB64)
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuf,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    PBKDF2_KEYLEN_BITS
  )
  return bufToBase64(derivedBits)
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string; algo: string }> {
  const salt = randomSaltBase64(16)
  const hash = await deriveKey(password, salt)
  return { hash, salt, algo: PASSWORD_ALGO }
}

export async function verifyPassword(password: string, saltB64: string, expectedHashB64: string): Promise<boolean> {
  const computed = await deriveKey(password, saltB64)
  return timingSafeEqual(computed, expectedHashB64)
}

// Constant-time string comparison to avoid timing side-channels on hash compare.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export function sha256Hex(input: string): Promise<string> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)).then((buf) => {
    const bytes = new Uint8Array(buf)
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
  })
}

export function newUuid(): string {
  return crypto.randomUUID()
}
