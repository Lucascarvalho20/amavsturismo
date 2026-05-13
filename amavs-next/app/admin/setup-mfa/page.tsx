'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, CheckCircle, ArrowLeft, Copy, Eye, EyeOff } from 'lucide-react'
import Logo from '@/components/Logo'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'

type Step = 'intro' | 'qr' | 'verify' | 'done'

export default function SetupMFAPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startSetup = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: "Amav's Turismo Admin",
      })
      if (err) throw err
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setStep('qr')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao iniciar configuração.')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    if (code.length !== 6) return
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId })
      if (!challenge) { setError('Erro ao criar desafio 2FA.'); return }
      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      })
      if (verifyErr) {
        setError('Código inválido. Verifique o app e tente novamente.')
        return
      }
      setStep('done')
      toast.success('2FA ativado com sucesso!')
    } catch {
      setError('Erro ao verificar o código.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo variant="full" size="lg" href="/admin/dashboard" className="inline-flex justify-center mb-4" />
        </div>

        <div className="glass-dark rounded-2xl p-8 border border-gold/10">
          {step === 'intro' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck size={30} className="text-gold" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-white mb-2">Configurar 2FA</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Instale o <strong className="text-white">Google Authenticator</strong> ou{' '}
                  <strong className="text-white">Authy</strong> no seu celular antes de continuar.
                </p>
              </div>
              <Button variant="gold" size="lg" fullWidth loading={loading} onClick={startSetup}>
                Começar configuração
              </Button>
              <a href="/admin/perfil" className="flex items-center justify-center gap-1 text-gray-500 hover:text-gray-300 text-sm transition-colors">
                <ArrowLeft size={14} />
                Voltar ao perfil
              </a>
            </div>
          )}

          {step === 'qr' && (
            <div className="space-y-5">
              <h1 className="font-heading font-bold text-xl text-white">Escanear QR Code</h1>
              <p className="text-gray-400 text-sm">Abra o app autenticador e escaneie o código abaixo.</p>

              {qrCode && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-2xl">
                    <img src={qrCode} alt="QR Code 2FA" className="w-44 h-44" />
                  </div>
                </div>
              )}

              <div className="bg-navy-200 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-2">Não consegue escanear? Use a chave manual:</p>
                <div className="flex items-center gap-2">
                  <code className="text-gold text-xs font-mono flex-1 break-all">
                    {showSecret ? secret : '•'.repeat(32)}
                  </code>
                  <button onClick={() => setShowSecret(!showSecret)} className="text-gray-400 hover:text-white p-1">
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(secret); toast.success('Copiado!') }}
                    className="text-gray-400 hover:text-gold p-1"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <Button variant="gold" size="lg" fullWidth onClick={() => setStep('verify')}>
                Já escaniei → Próximo
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-5">
              <h1 className="font-heading font-bold text-xl text-white">Confirmar Configuração</h1>
              <p className="text-gray-400 text-sm">Insira o código de 6 dígitos do app autenticador.</p>

              <Input
                label="Código de verificação"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.4em] font-mono"
                autoFocus
                error={error}
              />

              <div className="flex gap-3">
                <Button variant="navy" className="flex-1" onClick={() => setStep('qr')}>Voltar</Button>
                <Button variant="gold" className="flex-1" loading={loading} disabled={code.length !== 6} onClick={verifyCode}>
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={30} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-white mb-2">2FA Ativado!</h1>
                <p className="text-gray-400 text-sm">
                  Sua conta agora exige o código do autenticador a cada login.
                </p>
              </div>
              <Button as="a" href="/admin/dashboard" variant="gold" size="lg" fullWidth>
                Ir para o Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
