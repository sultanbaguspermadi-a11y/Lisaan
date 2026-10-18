import { describe, expect, it } from 'vitest'
import {
  detectScript,
  escapeLike,
  normalizeArabic,
  normalizeLatin,
  normalizeQuery,
  slugify,
  stripHarakat,
} from '@/lib/arabic/normalize'

describe('normalizeArabic', () => {
  it('menghapus harakat', () => {
    expect(normalizeArabic('كِتَابٌ')).toBe('كتاب')
    expect(normalizeArabic('مُحَمَّدٌ')).toBe('محمد')
  })

  it('menyamakan varian alif', () => {
    for (const v of ['أحمد', 'إحمد', 'آحمد', 'ٱحمد']) expect(normalizeArabic(v)).toBe('احمد')
  })

  it('menyamakan ta marbuta dengan ha dan alif maqsura dengan ya', () => {
    expect(normalizeArabic('مَدْرَسَةٌ')).toBe('مدرسه')
    expect(normalizeArabic('مَدْرَسَه')).toBe('مدرسه')
    expect(normalizeArabic('مُسْتَشْفَى')).toBe('مستشفي')
  })

  it('menghapus tatweel dan merapikan spasi', () => {
    expect(normalizeArabic('  كـــتاب   جديد ')).toBe('كتاب جديد')
  })

  it('kata dengan dan tanpa harakat menghasilkan bentuk yang sama', () => {
    expect(normalizeArabic('قَاعِدَةُ بَيَانَاتٍ')).toBe(normalizeArabic('قاعدة بيانات'))
  })

  it('string kosong tetap kosong', () => {
    expect(normalizeArabic('')).toBe('')
  })
})

describe('stripHarakat', () => {
  it('hanya menghapus harakat, huruf tidak diubah', () => {
    expect(stripHarakat('أَكَلَ')).toBe('أكل')
    expect(stripHarakat('مَدْرَسَةٌ')).toBe('مدرسة')
  })
})

describe('normalizeLatin', () => {
  it('menghapus diakritik dan tanda hamza/ain', () => {
    expect(normalizeLatin('kitābun')).toBe('kitabun')
    expect(normalizeLatin('mu‘allimun')).toBe('muallimun')
    expect(normalizeLatin('qur’ānun')).toBe('quranun')
    expect(normalizeLatin('ṣadīqun')).toBe('sadiqun')
  })

  it('huruf kecil dan spasi rapi', () => {
    expect(normalizeLatin('  Sistem   OPERASI ')).toBe('sistem operasi')
  })
})

describe('detectScript / normalizeQuery', () => {
  it('mendeteksi aksara', () => {
    expect(detectScript('kitab')).toBe('latin')
    expect(detectScript('كتاب')).toBe('ar')
    expect(detectScript('book كتاب')).toBe('ar')
  })

  it('menormalisasi sesuai aksara', () => {
    expect(normalizeQuery('كِتَابٌ')).toEqual({ script: 'ar', norm: 'كتاب' })
    expect(normalizeQuery('Kitāb')).toEqual({ script: 'latin', norm: 'kitab' })
  })
})

describe('escapeLike', () => {
  it('meng-escape karakter khusus LIKE', () => {
    expect(escapeLike('100%_a\\b')).toBe('100\\%\\_a\\\\b')
  })
})

describe('slugify', () => {
  it('membuat slug dari transliterasi', () => {
    expect(slugify('qā‘idatu bayānātin')).toBe('qaidatu-bayanatin')
    expect(slugify('ṣalātun')).toBe('salatun')
  })
})
