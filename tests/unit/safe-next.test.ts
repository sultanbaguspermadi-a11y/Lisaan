import { describe, expect, it } from 'vitest'
import { safeNext } from '@/lib/safe-next'

describe('safeNext', () => {
  it('menerima path internal', () => {
    expect(safeNext('/favorites')).toBe('/favorites')
    expect(safeNext('/search?q=kitab')).toBe('/search?q=kitab')
  })

  it('menolak URL luar dan variasi protocol-relative', () => {
    for (const bad of [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      'javascript:alert(1)',
      '',
      undefined,
      42,
    ]) {
      expect(safeNext(bad)).toBe('/')
    }
  })

  it('menolak karakter kontrol dan memakai fallback kustom', () => {
    expect(safeNext('/a\nb')).toBe('/')
    expect(safeNext('x', '/home')).toBe('/home')
  })
})
