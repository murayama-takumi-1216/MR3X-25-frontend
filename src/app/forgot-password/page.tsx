'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authAPI } from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email) {
      toast.error('Informe o e-mail cadastrado')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authAPI.forgotPassword(email)

      if (response?.cooldownSeconds) {
        toast.info(`Aguarde ${response.cooldownSeconds} segundos antes de solicitar novamente.`)
        return
      }

      setEmailSent(true)
      toast.success('Se o e-mail estiver cadastrado, enviaremos instruções de redefinição.')
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error)
      toast.error(error?.message || 'Não foi possível enviar o e-mail de redefinição')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Recuperar Senha</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Informe o e-mail cadastrado para receber o link de redefinição.
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Se o endereço <strong>{email}</strong> estiver cadastrado, você receberá um e-mail com instruções para redefinir sua senha nos próximos minutos.
                Lembre-se de verificar também a caixa de spam ou lixo eletrônico.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors"
                  onClick={() => router.push('/auth/login')}
                >
                  Ir para o login
                </button>
                <button
                  type="button"
                  className="w-full border border-border rounded-md py-2.5 px-4 text-sm font-medium hover:bg-muted/50"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                >
                  Solicitar novo link
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  E-mail cadastrado
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
              </button>
            </form>
          )}

          <div className="mt-4 sm:mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
              Voltar para o login
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Sistema de Gestão de Aluguéis
        </p>
      </div>
    </div>
  )
}
