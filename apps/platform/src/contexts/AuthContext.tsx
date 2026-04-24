import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// ──────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────

export type UserRole = 'candidato' | 'empresa' | 'admin' | null

interface AuthContextValue {
  user: User | null
  session: Session | null
  /** Role derivada do JWT. app_metadata tem prioridade (definida server-side pelo admin). */
  role: UserRole
  loading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null; role: UserRole }>
  signOut: () => Promise<void>
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

/**
 * Deriva o role do usuário a partir do JWT.
 * - app_metadata.role  → definido via service_role (admin da plataforma); mais seguro
 * - user_metadata.role → definido pelo próprio usuário no signUp (candidato/empresa)
 */
function deriveRole(user: User | null): UserRole {
  if (!user) return null
  const appRole = user.app_metadata?.role as string | undefined
  if (appRole) return appRole as UserRole
  const metaRole = user.user_metadata?.role as string | undefined
  return (metaRole as UserRole) ?? null
}

// ──────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restaura sessão existente (cookie / localStorage do Supabase)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // Escuta mudanças de estado (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    const role = deriveRole(data.user)
    return { error, role }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const role = deriveRole(user)

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ──────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
