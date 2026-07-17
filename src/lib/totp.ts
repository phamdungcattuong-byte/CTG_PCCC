// TOTP (RFC 6238) / HOTP (RFC 4226) implemented on the Web Crypto API only —
// Cloudflare Workers has no Node `crypto` module, so this cannot use any
// npm TOTP package that depends on Node's `crypto`/`Buffer`. Compatible with
// standard authenticator apps (Google Authenticator, Authy, 1Password...):
// SHA-1 HMAC, 6 digits, 30-second step — the universal defaults those apps
// assume when no algorithm/digits/period params are given in the otpauth URI.
const STEP_SECONDS = 30
const DIGITS = 6
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function randomBase32Secret(byteLen = 20): string {
  const bytes = new Uint8Array(byteLen)
  crypto.getRandomValues(bytes)
  return base32Encode(bytes)
}

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }
  return output
}

export function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i])
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(out)
}

function counterToBuffer(counter: number): ArrayBuffer {
  // 8-byte big-endian counter, per RFC 4226.
  const buf = new ArrayBuffer(8)
  const view = new DataView(buf)
  // JS numbers are safe integers well beyond any realistic counter value here.
  view.setUint32(0, Math.floor(counter / 2 ** 32))
  view.setUint32(4, counter % 2 ** 32)
  return buf
}

async function hotp(secretBase32: string, counter: number, digits = DIGITS): Promise<string> {
  const keyBytes = base32Decode(secretBase32)
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, counterToBuffer(counter))
  const hmac = new Uint8Array(sig)
  const offset = hmac[hmac.length - 1] & 0x0f
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  const strCode = String(binCode % 10 ** digits)
  return strCode.padStart(digits, '0')
}

export async function currentTotp(secretBase32: string, forTimeMs = Date.now()): Promise<string> {
  const counter = Math.floor(forTimeMs / 1000 / STEP_SECONDS)
  return hotp(secretBase32, counter)
}

// Accepts a code generated within +/- 1 step (30s) of "now" to tolerate clock
// drift between the authenticator device and this server.
export async function verifyTotp(secretBase32: string, code: string, forTimeMs = Date.now(), window = 1): Promise<boolean> {
  const cleanCode = (code || '').replace(/\s+/g, '')
  if (!/^\d{6}$/.test(cleanCode)) return false
  const counter = Math.floor(forTimeMs / 1000 / STEP_SECONDS)
  for (let w = -window; w <= window; w++) {
    const candidate = await hotp(secretBase32, counter + w)
    if (candidate === cleanCode) return true
  }
  return false
}

export function buildOtpAuthUrl(secretBase32: string, accountLabel: string, issuer = 'CTG Command Center'): string {
  const label = encodeURIComponent(`${issuer}:${accountLabel}`)
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
