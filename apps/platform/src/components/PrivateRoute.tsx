import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth, type UserRole } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface PrivateRouteProps {
  children: React.ReactNode
  /** Roles que têm acesso à rota. Se vazio, qualquer usuário autenticado passa. */
  allowedRoles?: UserRole[]
  /** Para onde redirecionar se não autenticado. Padrão: /login */
  redirectTo?: string
  /**
   * Se true, exige sessão aal2 (MFA verificado).
   * Usar apenas em rotas admin (/vo-painel).
   */
  requireMfa?: boolean
}

/**
 * Guarda de rota baseado no Supabase Auth.
 * - Se ainda carregando: exibe spinner
 * - Se não autenticado: redireciona para redirectTo?redirect=<rota atual>
 * - Se autenticado mas sem role permitida: redireciona para redirectTo
 * - Se requireMfa=true e sessão não for aal2: redireciona para redirectTo
 */
export default function PrivateRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
  requireMfa = false,
}: PrivateRouteProps) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  const [aalChecking, setAalChecking] = useState(requireMfa)
  const [aalOk, setAalOk] = useState(false)

  useEffect(() => {
    if (!requireMfa || !user) {
      setAalChecking(false)
      return
    }
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      setAalOk(data?.currentLevel === 'aal2')
      setAalChecking(false)
    })
  }, [user, requireMfa])

  // Ainda carregando auth ou verificação AAL
  if (loading || aalChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-gray-500 text-3xl"></i>
      </div>
    )
  }

  // Não autenticado
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${redirectTo}?redirect=${next}`} replace />
  }

  // Role não permitida
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />
  }

  // MFA exigido mas sessão ainda em aal1
  if (requireMfa && !aalOk) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
