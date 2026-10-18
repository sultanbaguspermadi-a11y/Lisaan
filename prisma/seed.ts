import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { normalizeArabic, normalizeLatin, slugify } from '../src/lib/arabic/normalize'
import { CATEGORIES, ENTRIES, EXAMPLES, MAJORS, PLURALS, VERB_FORMS } from './seed-data'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL belum diisi. Salin .env.example menjadi .env lalu isi.')

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })

async function main() {
  const majorIds = new Map<string, string>()
  for (const [i, m] of MAJORS.entries()) {
    const row = await db.major.upsert({
      where: { slug: m.slug },
      create: { ...m, sortOrder: i },
      update: { ...m, sortOrder: i },
    })
    majorIds.set(m.slug, row.id)
  }

  const categoryIds = new Map<string, string>()
  for (const [i, c] of CATEGORIES.entries()) {
    const { major, ...fields } = c
    const data = { ...fields, sortOrder: i, majorId: major ? (majorIds.get(major) ?? null) : null }
    const row = await db.category.upsert({ where: { slug: c.slug }, create: data, update: data })
    categoryIds.set(c.slug, row.id)
  }

  const seenSlugs = new Set<string>()
  let published = 0

  for (const e of ENTRIES) {
    const slug = slugify(e.translit)
    if (seenSlugs.has(slug)) throw new Error(`Slug ganda pada data seed: ${slug}`)
    seenSlugs.add(slug)

    const base = {
      slug,
      headword: e.headword,
      headwordNorm: normalizeArabic(e.headword),
      translit: e.translit,
      translitNorm: normalizeLatin(e.translit),
      pos: e.pos,
      gender: e.gender,
      root: e.root,
      plural: PLURALS[slug] ?? null,
      forms: VERB_FORMS[slug] ?? undefined,
      usageNote:
        e.pos === 'VERB'
          ? 'Kata kerja dicantumkan dalam bentuk lampau (madhi) orang ketiga maskulin tunggal, sesuai kebiasaan kamus Arab.'
          : null,
      status: e.status,
      publishedAt: e.status === 'PUBLISHED' ? new Date() : null,
    }
    const entry = await db.entry.upsert({ where: { slug }, create: base, update: base })

    await db.$transaction([
      db.meaning.deleteMany({ where: { entryId: entry.id } }),
      db.example.deleteMany({ where: { entryId: entry.id } }),
      db.entryCategory.deleteMany({ where: { entryId: entry.id } }),
      db.meaning.createMany({
        data: [
          ...e.meaningsId.map((text, sortOrder) => ({
            entryId: entry.id,
            lang: 'id',
            text,
            textNorm: normalizeLatin(text),
            sortOrder,
          })),
          ...e.meaningsEn.map((text, sortOrder) => ({
            entryId: entry.id,
            lang: 'en',
            text,
            textNorm: normalizeLatin(text),
            sortOrder,
          })),
        ],
      }),
      db.entryCategory.createMany({
        data: e.categories.map((c) => {
          const categoryId = categoryIds.get(c)
          if (!categoryId) throw new Error(`Kategori tidak dikenal pada seed: ${c}`)
          return { entryId: entry.id, categoryId }
        }),
      }),
      ...(EXAMPLES[slug]
        ? [
            db.example.create({
              data: {
                entryId: entry.id,
                arabic: EXAMPLES[slug][0],
                translation: EXAMPLES[slug][1],
              },
            }),
          ]
        : []),
    ])
    if (e.status === 'PUBLISHED') published += 1
  }

  console.log(
    `Seed selesai: ${MAJORS.length} jurusan, ${CATEGORIES.length} kategori, ${ENTRIES.length} entri (${published} Published).`,
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
