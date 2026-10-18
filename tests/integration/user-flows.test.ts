import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/client'
import { addFavorite, isFavorite, listFavorites, removeFavorite } from '@/server/favorites'
import { clearHistory, listHistory, recordHistory, recordMiss } from '@/server/history'
import { getStudyCards, reviewCard } from '@/server/srs'

const hasDb = Boolean(process.env.DATABASE_URL)
const email = 'integration-uji@example.com'

describe.skipIf(!hasDb)('alur pengguna (butuh database yang sudah di-seed)', () => {
  let userId = ''
  let kitabId = ''

  beforeAll(async () => {
    const db = getDb()
    await db.user.deleteMany({ where: { email } })
    userId = (await db.user.create({ data: { email, name: 'Uji Integrasi' } })).id
    kitabId = (await db.entry.findUniqueOrThrow({ where: { slug: 'kitabun' } })).id
  })

  afterAll(async () => {
    await getDb().user.deleteMany({ where: { email } })
    await getDb().searchMiss.deleteMany({ where: { queryNorm: 'zzuji' } })
  })

  it('favorit: idempoten, muncul di daftar, dan bisa dihapus', async () => {
    expect(await addFavorite(userId, kitabId)).toBe(true)
    expect(await addFavorite(userId, kitabId)).toBe(true)
    expect(await isFavorite(userId, kitabId)).toBe(true)
    const { entries } = await listFavorites(userId, 'id', 1, 10)
    expect(entries.map((e) => e.slug)).toEqual(['kitabun'])
    await removeFavorite(userId, kitabId)
    expect(await isFavorite(userId, kitabId)).toBe(false)
  })

  it('favorit menolak entri yang tidak ada atau belum Published', async () => {
    expect(await addFavorite(userId, 'tidak-ada')).toBe(false)
    const review = await getDb().entry.findUniqueOrThrow({ where: { slug: 'rasulun' } })
    expect(await addFavorite(userId, review.id)).toBe(false)
  })

  it('riwayat: satu baris per kueri dan bisa dihapus', async () => {
    await recordHistory(userId, 'Kitab', 'kitab')
    await recordHistory(userId, 'kitab ', 'kitab')
    await recordHistory(userId, 'oli', 'oli')
    const items = await listHistory(userId)
    expect(items.map((i) => i.query)).toEqual(['oli', 'kitab '])
    await clearHistory(userId)
    expect(await listHistory(userId)).toEqual([])
  })

  it('pencarian tanpa hasil menaikkan penghitung', async () => {
    await recordMiss('zzuji')
    await recordMiss('zzuji')
    const row = await getDb().searchMiss.findUniqueOrThrow({ where: { queryNorm: 'zzuji' } })
    expect(row.count).toBe(2)
  })

  it('flashcard: kartu baru dibuat, jurusan diprioritaskan, review menjadwalkan ulang', async () => {
    const cards = await getStudyCards(userId, 'id', 'akt')
    expect(cards).toHaveLength(10)
    const accountingSlugs = new Set(
      (
        await getDb().entry.findMany({
          where: { categories: { some: { category: { slug: 'akt' } } } },
          select: { slug: true },
        })
      ).map((e) => e.slug),
    )
    expect(cards.every((c) => accountingSlugs.has(c.slug))).toBe(true)
    expect(cards.every((c) => c.meaning.length > 0)).toBe(true)

    const first = cards[0]!
    const updated = await reviewCard(userId, first.entryId, 4)
    expect(updated?.intervalD).toBe(1)
    expect(updated!.dueAt.getTime()).toBeGreaterThan(Date.now())

    const again = await getStudyCards(userId, 'id', 'akt')
    expect(again.some((c) => c.entryId === first.entryId)).toBe(false)
    expect(await reviewCard(userId, 'tidak-ada', 4)).toBeNull()
  })
})
