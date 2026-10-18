import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/client'
import { normalizeArabic, normalizeLatin } from '@/lib/arabic/normalize'
import { searchEntries } from '@/server/search'
import {
  getPublishedEntry,
  getWordOfTheDay,
  listCategories,
  listCategoryEntries,
} from '@/server/entries'

const hasDb = Boolean(process.env.DATABASE_URL)
const slugs = async (q: string, extra: Partial<Parameters<typeof searchEntries>[0]> = {}) =>
  (await searchEntries({ q, ...extra })).hits.map((h) => h.slug)

describe.skipIf(!hasDb)('pencarian (butuh database yang sudah di-seed)', () => {
  const draftSlug = 'zz-draft-uji'

  beforeAll(async () => {
    const count = await getDb().entry.count({ where: { status: 'PUBLISHED' } })
    if (count < 100)
      throw new Error('Jalankan `npm run db:seed` sebelum menjalankan tes integrasi.')
    await getDb().entry.upsert({
      where: { slug: draftSlug },
      create: {
        slug: draftSlug,
        headword: 'كِتَابَانِ',
        headwordNorm: normalizeArabic('كِتَابَانِ'),
        translit: 'kitabani uji',
        translitNorm: normalizeLatin('kitabani uji'),
        pos: 'NOUN',
        status: 'DRAFT',
        meanings: { create: [{ lang: 'id', text: 'dua buku uji', textNorm: 'dua buku uji' }] },
      },
      update: { status: 'DRAFT' },
    })
  })

  afterAll(async () => {
    await getDb().entry.deleteMany({ where: { slug: draftSlug } })
  })

  it('kata Arab dengan atau tanpa harakat memberi hasil teratas yang sama', async () => {
    const withHarakat = await slugs('كِتَابٌ')
    const without = await slugs('كتاب')
    expect(withHarakat[0]).toBe('kitabun')
    expect(without[0]).toBe('kitabun')
  })

  it('varian alif, ta marbuta, dan transliterasi menemukan entri yang sama', async () => {
    expect((await slugs('مدرسه'))[0]).toBe('madrasatun')
    expect((await slugs('مدرسة'))[0]).toBe('madrasatun')
    expect((await slugs('madrasa'))[0]).toBe('madrasatun')
    expect((await slugs('qaraa'))[0]).toBe('qaraa')
    expect((await slugs('qara’a'))[0]).toBe('qaraa')
  })

  it('arah Indonesia: arti persis berada di atas arti yang hanya mengandung', async () => {
    const result = await slugs('buku')
    expect(result[0]).toBe('kitabun')
  })

  it('exact mengalahkan prefix, prefix mengalahkan contains', async () => {
    const { hits } = await searchEntries({ q: 'kitab' })
    const scores = hits.map((h) => h.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
    expect(hits[0]?.slug).toBe('kitabun')
  })

  it('fuzzy menemukan kata dengan salah ketik ringan', async () => {
    expect(await slugs('kitaab')).toContain('kitabun')
  })

  it('jurusan pengguna menaikkan peringkat entri jurusan itu', async () => {
    const plain = await slugs('mesin')
    const boosted = await slugs('mesin', { major: 'tsm' })
    expect(boosted[0]).toBe('muharrikun')
    expect(plain).toContain('muharrikun')
  })

  it('entri Draft tidak pernah muncul di pencarian maupun detail publik', async () => {
    expect(await slugs('kitabani')).not.toContain(draftSlug)
    expect(await slugs('كتابان')).not.toContain(draftSlug)
    expect(await getPublishedEntry(draftSlug)).toBeNull()
  })

  it('entri berstatus Review dari seed tidak terlihat publik', async () => {
    expect(await slugs('rasul')).not.toContain('rasulun')
    expect(await getPublishedEntry('rasulun')).toBeNull()
  })

  it('kueri tanpa hasil mengembalikan daftar kosong, kueri berisi karakter LIKE aman', async () => {
    expect((await searchEntries({ q: 'zzzzqx' })).hits).toEqual([])
    expect((await searchEntries({ q: '%' })).hits).toEqual([])
    expect((await searchEntries({ q: '_' })).hits).toEqual([])
  })

  it('paginasi: halaman berbeda tidak tumpang tindih dan hasMore benar', async () => {
    const p1 = await searchEntries({ q: 'a', limit: 5, page: 1 })
    const p2 = await searchEntries({ q: 'a', limit: 5, page: 2 })
    expect(p1.hits).toHaveLength(5)
    expect(p1.hasMore).toBe(true)
    const ids1 = new Set(p1.hits.map((h) => h.id))
    expect(p2.hits.some((h) => ids1.has(h.id))).toBe(false)
  })

  it('detail entri memuat arti, kategori, bentuk kata kerja, dan contoh', async () => {
    const verb = await getPublishedEntry('kataba')
    expect(verb?.forms).toMatchObject({ madhi: 'كَتَبَ', masdar: 'كِتَابَةٌ' })
    expect(verb?.meanings.some((m) => m.lang === 'id' && m.text === 'menulis')).toBe(true)
    expect(verb?.examples.length).toBeGreaterThan(0)
    expect(verb?.categories.map((c) => c.category.slug)).toContain('umum')
  })

  it('kategori dan kata hari ini hanya memakai entri Published', async () => {
    const cats = await listCategories()
    expect(cats.length).toBeGreaterThanOrEqual(6)
    for (const c of cats) expect(c.entryCount).toBeGreaterThanOrEqual(15)
    const rpl = await listCategoryEntries('rpl', 1, 100, 'id')
    expect(rpl.entries.some((e) => e.slug === 'dhakiratun')).toBe(false)
    const wotd = await getWordOfTheDay('id', new Date('2026-06-01T00:00:00Z'))
    expect(wotd?.slug).toBeTruthy()
  })
})
