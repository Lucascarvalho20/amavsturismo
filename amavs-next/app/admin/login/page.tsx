'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react'
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
  const router = useRouter()
  const supabase = createClient()
  const [showPw, setShowPw] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [blockResetAt, setBlockResetAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const getClientIP = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/admin/check-rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: getValues('email'), checkOnly: true }),
      })
      const data = await res.json()
      return data.ip || null
    } catch {
      return null
    }
  }

  const onSubmit = async (data: FormData) => {
    if (blocked) {
      toast.error('Conta bloqueada. Tente novamente mais tarde.')
      return
    }

    setLoading(true)

    try {
      // Check rate limit
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

      // Attempt login
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      // Log attempt
      await fetch('/api/admin/log-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          success: !error,
        }),
      })

      if (error) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 5) {
          setBlocked(true)
          toast.error('Conta bloqueada por excesso de tentativas.')
        } else {
          toast.error('E-mail ou senha incorretos.')
        }
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

  return (
    <div className="min-h-screen bg-navy-200 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-40" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo variant="full" size="lg" href="/" className="inline-flex justify-center mb-4" />
          <h1 className="font-heading font-bold text-white text-xl">Painel Administrativo</h1>
          <p className="text-gray-400 text-sm mt-1">Acesso restrito a administradores</p>
        </div>

        {/* Card */}
        <div className="glass-dark rounded-2xl p-7 border border-gold/10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Lock size={16} className="text-gold" />
            </div>
            <span className="text-gray-300 text-sm font-medium">Entrar na sua conta</span>
          </div>

          {/* Blocked warning */}
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
              </div>
            </div>
          )}

          {/* Warning after 2 fails */}
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

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <a
              href="/"
              className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
            >
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
