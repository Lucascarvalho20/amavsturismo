'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertTriangle, Lock, Mail, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha muito curta'),
})

type FormData = z.infer<typeof schema>

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  )
}

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Segunda etapa (2FA TOTP)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const notAuthorized = searchParams.get('motivo') === 'nao_autorizado'

  // Retorna o id do fator TOTP se a sessão atual ainda precisa do código 2FA.
  const pendingMfaFactor = async (): Promise<string | null> => {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (!aal || aal.nextLevel !== 'aal2' || aal.currentLevel === 'aal2') return null
    const { data: factors } = await supabase.auth.mfa.listFactors()
    return factors?.totp?.find((f) => f.status === 'verified')?.id ?? null
  }

  // Usuário que já passou pela senha e foi devolvido pelo middleware para validar o 2FA
  useEffect(() => {
    if (searchParams.get('motivo') !== '2fa') return
    pendingMfaFactor().then((id) => id && setMfaFactorId(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const verifyMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaFactorId || mfaCode.length !== 6) return
    setMfaLoading(true)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaFactorId, code: mfaCode })
    setMfaLoading(false)
    if (error) {
      setMfaCode('')
      toast.error('Código inválido ou expirado.')
      return
    }
    toast.success('Login realizado com sucesso!')
    router.replace('/admin/dashboard')
    router.refresh()
  }

  const cancelMfa = async () => {
    await supabase.auth.signOut()
    setMfaFactorId(null)
    setMfaCode('')
  }
  const [showPw, setShowPw] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [blockResetAt, setBlockResetAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Recuperação de senha
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (blocked) {
      toast.error('Conta bloqueada. Tente novamente mais tarde.')
      return
    }

    setLoading(true)

    try {
      // 1. E-mail bloqueado por excesso de tentativas?
      const rlRes = await fetch('/api/admin/check-rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
      const rlData = await rlRes.json()

      if (rlData.blocked) {
        setBlocked(true)
        setBlockResetAt(rlData.resetAt)
        toast.error('Muitas tentativas. Tente novamente em 15 minutos.')
        setLoading(false)
        return
      }

      // 2. Senha
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      // 3. Registra a tentativa, com sucesso ou não
      await fetch('/api/admin/log-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, success: !error }),
      })

      if (error) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        const msg = error.message?.toLowerCase() ?? ''
        let friendlyMsg = 'E-mail ou senha incorretos.'
        if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
          friendlyMsg = 'E-mail não confirmado. Verifique sua caixa de entrada.'
        } else if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
          friendlyMsg = 'E-mail ou senha incorretos.'
        } else if (msg.includes('too many')) {
          friendlyMsg = 'Muitas tentativas. Aguarde alguns minutos.'
        }
        if (newAttempts >= 5) {
          setBlocked(true)
          toast.error('Conta bloqueada por excesso de tentativas.')
        } else {
          toast.error(friendlyMsg)
        }
        setLoading(false)
        return
      }

      const factorId = await pendingMfaFactor()
      if (factorId) {
        setMfaFactorId(factorId)
        setLoading(false)
        return
      }

      toast.success('Login realizado com sucesso!')
      router.replace('/admin/dashboard')
    } catch (err) {
      console.error(err)
      toast.error('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail || !forgotEmail.includes('@')) {
      toast.error('Digite um e-mail válido.')
      return
    }
    setForgotLoading(true)
    try {
      // next= garante que o fluxo PKCE (code) também redireciona para a tela de reset
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
        redirectTo,
      })
      if (error) {
        toast.error(error.message)
      } else {
        setForgotSent(true)
      }
    } catch {
      toast.error('Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-40" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo variant="full" size="lg" href="/" className="inline-flex justify-center mb-4" />
          <h1 className="font-heading font-bold text-white text-xl">Painel Administrativo</h1>
          <p className="text-gray-400 text-sm mt-1">Acesso restrito a administradores</p>
        </div>

        <div className="glass-dark rounded-2xl p-7 border border-gold/10">

          {notAuthorized && !mfaFactorId && (
            <div className="flex items-start gap-2 bg-wine/20 border border-wine/30 rounded-xl p-3 mb-5">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">Esta conta não tem permissão de administrador.</p>
            </div>
          )}

          {mfaFactorId ? (
            <form onSubmit={verifyMfa} className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-gold" />
                </div>
                <span className="text-gray-300 text-sm font-medium">Verificação em duas etapas</span>
              </div>
              <p className="text-gray-400 text-sm">
                Digite o código de 6 dígitos do seu aplicativo autenticador (Google Authenticator, Authy…).
              </p>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center tracking-[0.6em] text-2xl font-mono bg-navy-100 border border-white/10 rounded-xl py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/40"
                placeholder="000000"
                aria-label="Código 2FA"
              />
              <Button type="submit" variant="gold" size="lg" fullWidth loading={mfaLoading} disabled={mfaCode.length !== 6}>
                Verificar
              </Button>
              <button type="button" onClick={cancelMfa} className="w-full text-gray-500 hover:text-gray-300 text-xs">
                Cancelar e sair
              </button>
            </form>
          ) : forgotMode ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail('') }}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <ArrowLeft size={15} className="text-gray-400" />
                </button>
                <span className="text-gray-300 text-sm font-medium">Recuperar senha</span>
              </div>

              {forgotSent ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">E-mail enviado!</p>
                  <p className="text-gray-400 text-sm">
                    Verifique sua caixa de entrada em <span className="text-gold">{forgotEmail}</span> e clique no link para redefinir sua senha.
                  </p>
                  <p className="text-gray-500 text-xs mt-3">Não encontrou? Verifique a pasta de spam.</p>
                  <button
                    onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail('') }}
                    className="mt-5 text-gray-400 hover:text-gold text-sm transition-colors"
                  >
                    ← Voltar ao login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-2">
                    <Mail size={15} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-xs">
                      Insira o e-mail cadastrado no Supabase. Você receberá um link para redefinir sua senha.
                    </p>
                  </div>
                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="admin@amavsturismo.com.br"
                    autoComplete="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="gold" size="lg" fullWidth loading={forgotLoading}>
                    Enviar link de recuperação
                  </Button>
                </form>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Lock size={16} className="text-gold" />
                </div>
                <span className="text-gray-300 text-sm font-medium">Entrar na sua conta</span>
              </div>

              {blocked && (
                <div className="flex items-start gap-2 bg-wine/20 border border-wine/30 rounded-xl p-3 mb-5">
                  <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-medium">Conta temporariamente bloqueada</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {blockResetAt
                        ? `Tente novamente às ${new Date(blockResetAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Tente novamente em 15 minutos.'}
                    </p>
                    <button
                      onClick={() => { setForgotMode(true); setForgotEmail(getValues('email') || '') }}
                      className="text-gold text-xs mt-1.5 hover:underline"
                    >
                      Redefinir minha senha →
                    </button>
                  </div>
                </div>
              )}

              {!blocked && attempts >= 2 && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5">
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-400 text-sm">
                    {5 - attempts} tentativa{5 - attempts !== 1 ? 's' : ''} restante{5 - attempts !== 1 ? 's' : ''} antes do bloqueio.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="admin@amavsturismo.com.br"
                  autoComplete="email"
                  {...register('email')}
                  error={errors.email?.message}
                  required
                  disabled={blocked}
                />
                <div>
                  <Input
                    label="Senha"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    error={errors.password?.message}
                    required
                    disabled={blocked}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="text-gray-400 hover:text-gold transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setForgotEmail(getValues('email') || '') }}
                    className="text-gray-500 hover:text-gold text-xs mt-1.5 float-right transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={blocked}
                >
                  Entrar
                </Button>
              </form>
            </>
          )}

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <a href="/" className="text-gray-500 hover:text-gray-400 text-xs transition-colors">
              ← Voltar para o site
            </a>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Amav's Turismo © {new Date().getFullYear()} — Acesso restrito
        </p>
      </div>
    </div>
  )
}
