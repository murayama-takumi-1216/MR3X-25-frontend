'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { authAPI } from '@/lib/api'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetCompleted, setResetCompleted] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!token) {
      toast.error('Token inválido ou ausente. Solicite uma nova redefinição de senha.')
      return
    }

    if (password.length < 6) {
      toast.error('A nova senha deve conter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)
    try {
      await authAPI.resetPassword(token, password)
      setResetCompleted(true)
      toast.success('Senha redefinida com sucesso. Faça login novamente.')
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error)
      toast.error(error?.message || 'Não foi possível redefinir a senha. Solicite um novo link.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderContent = () => {
    if (!token) {
      return (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            O link de redefinição é inválido ou expirou. Solicite uma nova redefinição de senha.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            Solicitar novo link
          </Link>
        </div>
      )
    }

    if (resetCompleted) {
      return (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sua senha foi redefinida com sucesso. Utilize a nova senha para acessar a plataforma.
          </p>
          <button
            type="button"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors"
            onClick={() => router.push('/auth/login')}
          >
            Ir para o login
          </button>
        </div>
      )
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
        </button>
      </form>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Redefinir Senha</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Escolha uma nova senha para acessar sua conta MR3X.
            </p>
          </div>

          {renderContent()}

          {!resetCompleted && token && (
            <div className="mt-4 sm:mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                Voltar para o login
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Sistema de Gestão de Aluguéis
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
