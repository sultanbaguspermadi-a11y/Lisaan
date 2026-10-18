import { describe, expect, it } from 'vitest'
import { createT, messagesFor, meaningLang } from '@/lib/i18n'

describe('i18n', () => {
  it('ketiga bahasa memiliki kunci yang sama persis', () => {
    const keys = (l: 'id' | 'en' | 'ar') => Object.keys(messagesFor(l)).sort()
    expect(keys('en')).toEqual(keys('id'))
    expect(keys('ar')).toEqual(keys('id'))
  })

  it('tidak ada pesan kosong dan placeholder konsisten antar bahasa', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',')
    const base = messagesFor('id')
    for (const l of ['en', 'ar'] as const) {
      for (const [key, value] of Object.entries(messagesFor(l))) {
        expect(value.trim(), `${l}:${key}`).not.toBe('')
        expect(placeholders(value), `${l}:${key}`).toBe(
          placeholders(base[key as keyof typeof base]),
        )
      }
    }
  })

  it('mengisi variabel dan arti Arab memakai bahasa Indonesia sebagai cadangan', () => {
    expect(createT('id')('learn.progress', { done: 2, total: 10 })).toBe('Kartu 2 dari 10')
    expect(meaningLang('ar')).toBe('id')
    expect(meaningLang('en')).toBe('en')
  })
})
