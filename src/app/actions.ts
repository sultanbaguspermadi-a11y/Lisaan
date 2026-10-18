'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { AuthError } from 'next-auth'
import { hash } from '@node-rs/argon2'
import { auth, signIn, signOut } from '@/lib/auth'
import { getDb } from '@/lib/db/client'
import type { MessageKey } from '@/lib/i18n'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { safeNext } from '@/lib/safe-next'
import { loginSchema, registerSchema } from '@/lib/validation'
import { clearHistory } from '@/server/history'

export interface FormState {
  error?: MessageKey
  /** nama bidang yang bermasalah, untuk aria-invalid */
  fields?: string[]
  values?: { name?: string; email?: string; major?: string }
}

const text = (data: FormData, key: string) => {
  const v = data.get(key)
  return typeof v === 'string' ? v : ''
}

export async function loginAction(_prev: FormState, data: FormData): Promise<FormState> {
  const email = text(data, 'email')
  const parsed = loginSchema.safeParse({ email, password: text(data, 'password') })
  if (!parsed.success) {
    return {
      error: 'auth.error.invalid',
      fields: parsed.error.issues.map((i) => String(i.path[0])),
      values: { email },
    }
  }
  const ip = clientIp(await headers())
  if (!rateLimit(`login-action:${ip}`, 30, 15 * 60_000).ok)
    return { error: 'auth.error.rate', values: { email } }

  try {
    await signIn('credentials', { ...parsed.data, redirectTo: safeNext(text(data, 'next')) })
  } catch (err) {
    if (err instanceof AuthError) return { error: 'auth.error.credentials', values: { email } }
    throw err // termasuk redirect sukses milik Next
  }
  return {}
}

export async function registerAction(_prev: FormState, data: FormData): Promise<FormState> {
  const values = {
    name: text(data, 'name'),
    email: text(data, 'email'),
    major: text(data, 'major'),
  }
  const parsed = registerSchema.safeParse({ ...values, password: text(data, 'password') })
  if (!parsed.success) {
    return {
      error: 'auth.error.invalid',
      fields: parsed.error.issues.map((i) => String(i.path[0])),
      values,
    }
  }
  const ip = clientIp(await headers())
  if (!rateLimit(`register:${ip}`, 5, 60 * 60_000).ok) return { error: 'auth.error.rate', values }

  const { name, email, password, major } = parsed.data
  const db = getDb()
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: 'auth.error.exists', fields: ['email'], values }
  }
  const majorRow = major
    ? await db.major.findUnique({ where: { slug: major }, select: { id: true } })
    : null
  try {
    await db.user.create({
      data: { name, email, passwordHash: await hash(password), majorId: majorRow?.id ?? null },
    })
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002')
      return { error: 'auth.error.exists', fields: ['email'], values }
    throw err
  }

  try {
    await signIn('credentials', { email, password, redirectTo: safeNext(text(data, 'next')) })
  } catch (err) {
    if (err instanceof AuthError) return { error: 'auth.error.credentials', values }
    throw err
  }
  return {}
}

export async function googleAction(data: FormData): Promise<void> {
  await signIn('google', { redirectTo: safeNext(text(data, 'next')) })
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/' })
}

export async function clearHistoryAction(): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  await clearHistory(session.user.id)
  revalidatePath('/history')
}
