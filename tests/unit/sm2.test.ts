import { describe, expect, it } from 'vitest'
import { DAY_MS, MIN_EASE, nextState } from '@/lib/srs/sm2'
import { dayIndex } from '@/lib/word-of-day'

const now = new Date('2026-01-01T00:00:00Z')
const fresh = { ease: 2.5, intervalD: 0, reps: 0 }

describe('nextState (SM-2)', () => {
  it('jawaban benar pertama: interval 1 hari', () => {
    const s = nextState(fresh, 4, now)
    expect(s.intervalD).toBe(1)
    expect(s.reps).toBe(1)
    expect(s.dueAt.getTime()).toBe(now.getTime() + DAY_MS)
  })

  it('jawaban benar kedua: interval 6 hari', () => {
    const s = nextState(nextState(fresh, 4, now), 4, now)
    expect(s.intervalD).toBe(6)
    expect(s.reps).toBe(2)
  })

  it('jawaban benar ketiga: interval dikali ease', () => {
    const second = nextState(nextState(fresh, 4, now), 4, now)
    const third = nextState(second, 4, now)
    expect(third.intervalD).toBe(Math.round(6 * second.ease))
  })

  it('lupa (kualitas < 3) mengulang dari awal', () => {
    const learned = nextState(nextState(fresh, 5, now), 5, now)
    const s = nextState(learned, 1, now)
    expect(s.reps).toBe(0)
    expect(s.intervalD).toBe(1)
  })

  it('ease tidak pernah di bawah batas minimum', () => {
    let s = { ...fresh }
    for (let i = 0; i < 30; i++) s = nextState(s, 1, now)
    expect(s.ease).toBeGreaterThanOrEqual(MIN_EASE)
  })

  it('mudah (5) menaikkan ease, sulit (3) menurunkannya', () => {
    expect(nextState(fresh, 5, now).ease).toBeGreaterThan(2.5)
    expect(nextState(fresh, 3, now).ease).toBeLessThan(2.5)
  })
})

describe('dayIndex', () => {
  it('stabil dalam satu hari dan berganti keesokan harinya', () => {
    const a = dayIndex(new Date('2026-03-01T01:00:00Z'), 140)
    const b = dayIndex(new Date('2026-03-01T23:59:00Z'), 140)
    const c = dayIndex(new Date('2026-03-02T00:01:00Z'), 140)
    expect(a).toBe(b)
    expect(c).toBe((a + 1) % 140)
  })

  it('selalu dalam rentang dan aman untuk total 0', () => {
    expect(dayIndex(now, 7)).toBeLessThan(7)
    expect(dayIndex(now, 0)).toBe(0)
  })
})
