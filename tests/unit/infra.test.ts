import { beforeEach, describe, expect, it } from 'vitest'
import { clientIp, rateLimit, resetRateLimits } from '@/lib/rate-limit'
import { DEFAULT_PREFS, parsePrefs, parsePrefsCookie, serializePrefs } from '@/lib/prefs'
import { loginSchema, registerSchema, reviewBodySchema, searchParamsSchema } from '@/lib/validation'
import { ApiError, errorResponse } from '@/lib/errors'

describe('rateLimit', () => {
  beforeEach(() => resetRateLimits())

  it('mengizinkan sampai batas lalu menolak', () => {
    const t = 1_000
    for (let i = 0; i < 3; i++) expect(rateLimit('k', 3, 60_000, t).ok).toBe(true)
    const blocked = rateLimit('k', 3, 60_000, t)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it('jendela baru setelah waktu habis dan kunci terpisah', () => {
    for (let i = 0; i < 4; i++) rateLimit('a', 3, 1_000, 0)
    expect(rateLimit('a', 3, 1_000, 2_000).ok).toBe(true)
    expect(rateLimit('b', 3, 1_000, 0).ok).toBe(true)
  })

  it('clientIp mengambil alamat pertama dari x-forwarded-for', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4')
    expect(clientIp(new Headers())).toBe('unknown')
  })
})

describe('prefs', () => {
  it('nilai kosong atau rusak jatuh ke default', () => {
    expect(parsePrefs({})).toEqual(DEFAULT_PREFS)
    expect(parsePrefs(null)).toEqual(DEFAULT_PREFS)
    expect(parsePrefsCookie('%E0%A4%A')).toBeNull()
    expect(parsePrefsCookie(undefined)).toBeNull()
  })

  it('bidang rusak diganti default tanpa membuang bidang lain yang valid', () => {
    const p = parsePrefs({ theme: 'neon', locale: 'en', showHarakat: false })
    expect(p.theme).toBe('auto')
    expect(p.locale).toBe('en')
    expect(p.showHarakat).toBe(false)
  })

  it('serialisasi cookie bolak-balik', () => {
    const prefs = parsePrefs({ theme: 'dark', locale: 'ar', major: 'rpl' })
    expect(parsePrefsCookie(serializePrefs(prefs))).toEqual(prefs)
  })
})

describe('validation', () => {
  it('registerSchema menolak kata sandi lemah dan menerima yang kuat', () => {
    const base = { name: 'Siti', email: 'Siti@Example.com', major: 'rpl' }
    expect(registerSchema.safeParse({ ...base, password: 'abcdefgh' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...base, password: '12345678' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...base, password: 'abc123' }).success).toBe(false)
    const ok = registerSchema.parse({ ...base, password: 'abcd1234' })
    expect(ok.email).toBe('siti@example.com')
  })

  it('loginSchema menolak email tidak valid', () => {
    expect(loginSchema.safeParse({ email: 'bukan-email', password: 'x' }).success).toBe(false)
  })

  it('searchParamsSchema memberi default dan membatasi rentang', () => {
    expect(searchParamsSchema.parse({ q: ' kitab ' })).toMatchObject({
      q: 'kitab',
      page: 1,
      limit: 20,
    })
    expect(searchParamsSchema.safeParse({ q: 'x', limit: 999 }).success).toBe(false)
    expect(searchParamsSchema.safeParse({ q: '   ' }).success).toBe(false)
    expect(searchParamsSchema.safeParse({ q: 'a'.repeat(81) }).success).toBe(false)
  })

  it('reviewBodySchema hanya menerima kualitas 1, 3, 4, 5', () => {
    expect(reviewBodySchema.safeParse({ entryId: 'x', quality: 4 }).success).toBe(true)
    expect(reviewBodySchema.safeParse({ entryId: 'x', quality: 2 }).success).toBe(false)
  })
})

describe('errorResponse', () => {
  it('ApiError dipetakan ke status dan bentuk seragam', async () => {
    const res = errorResponse(new ApiError(401, 'UNAUTHENTICATED', 'Masuk dulu.'))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: { code: 'UNAUTHENTICATED', message: 'Masuk dulu.' } })
  })

  it('error tak dikenal tidak membocorkan detail', async () => {
    const res = errorResponse(new Error('connection string postgres://secret'))
    expect(res.status).toBe(500)
    expect(JSON.stringify(await res.json())).not.toContain('secret')
  })

  it('ZodError menjadi 400 dengan daftar bidang', async () => {
    const parsed = searchParamsSchema.safeParse({ q: '' })
    if (parsed.success) throw new Error('seharusnya gagal')
    const res = errorResponse(parsed.error)
    expect(res.status).toBe(400)
    expect((await res.json()).error.fields).toHaveProperty('q')
  })
})
