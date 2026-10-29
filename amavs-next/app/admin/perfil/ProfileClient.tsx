'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Key, ShieldCheck, LogOut, CheckCircle, AlertTriangle, History, XCircle, MonitorSmartphone } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase-browser'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

export interface LoginRecord {
  created_at: string
  ip_address: string | null
  success: boolean
}

interface Props {
  userEmail: string
  createdAt: string
  lastSignInAt: string | null
  mfaSince: string | null
  recentLogins: LoginRecord[]
}

const MIN_PASSWORD_LENGTH = 10

export default function ProfileClient({ userEmail, createdAt, lastSignInAt, mfaSince, recentLogins }: Props) {
  const router = useRouter()
  const [changingPw, setChangingPw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [signingOut, setSigningOut] = useState<'local' | 'global' | null>(null)

  const failedLogins = recentLogins.filter((l) => !l.success).length

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (newPw.length < MIN_PASSWORD_LENGTH) {
      toast.error(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }
    const emailName = userEmail.split('@')[0].toLowerCase()
    if (emailName.length >= 4 && newPw.toLowerCase().includes(emailName)) {
      toast.error('A senha não pode conter o seu e-mail.')
      return
    }
    setPwLoading(true)
    try {
      const { error } = await createClient().auth.updateUser({ password: newPw })
      if (error) throw error
      toast.success('Senha alterada.')
      setChangingPw(false)
      setNewPw('')
      setConfirmPw('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar senha.')
    } finally {
      setPwLoading(false)
    }
  }

  // 'global' revoga as sessões de todos os aparelhos, não só a deste navegador
  const handleLogout = async (scope: 'local' | 'global') => {
    setSigningOut(scope)
    const { error } = await createClient().auth.signOut({ scope })
    if (error) {
      setSigningOut(null)
      toast.error('Não foi possível encerrar a sessão.')
      return
    }
    router.replace('/admin/login')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Perfil</h1>
        <p className="text-gray-400 text-sm mt-0.5">Configurações e segurança da conta</p>
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <h2 className="font-heading font-semibold text-white mb-4">Informações da Conta</h2>
        <div className="space-y-3">
          <div className="flex justify-between gap-4 py-2 border-b border-white/5">
            <span className="text-gray-400 text-sm">E-mail</span>
            <span className="text-white text-sm font-medium truncate">{userEmail}</span>
          </div>
          <div className="flex justify-between gap-4 py-2 border-b border-white/5">
            <span className="text-gray-400 text-sm">Último acesso</span>
            <span className="text-white text-sm">{lastSignInAt ? formatDateTime(lastSignInAt) : '—'}</span>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <span className="text-gray-400 text-sm">Conta criada em</span>
            <span className="text-white text-sm">{formatDateTime(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gold/10 border border-gold/20 rounded-xl">
            <ShieldCheck size={18} className="text-gold" />
          </div>
          <h2 className="font-heading font-semibold text-white">Autenticação em 2 Fatores (2FA)</h2>
        </div>
        {mfaSince ? (
          <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-gray-300 text-sm">
              Ativo desde {formatDateTime(mfaSince)}. Todo login pede o código do aplicativo autenticador.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 p-4 bg-gold/5 border border-gold/10 rounded-xl mb-4">
              <AlertTriangle size={16} className="text-gold mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-sm">
                Ainda não configurado. Com o 2FA, quem descobrir a sua senha não consegue entrar sem o
                código do aplicativo (Google Authenticator, Authy ou similar).
              </p>
            </div>
            <Button as="a" href="/admin/setup-mfa" variant="outline" size="sm" leftIcon={<ShieldCheck size={14} />}>
              Configurar 2FA
            </Button>
          </>
        )}
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Key size={18} className="text-blue-400" />
          </div>
          <h2 className="font-heading font-semibold text-white">Senha</h2>
        </div>

        {!changingPw ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">Use pelo menos {MIN_PASSWORD_LENGTH} caracteres, sem o seu e-mail.</p>
            <Button variant="outline" size="sm" onClick={() => setChangingPw(true)}>
              Alterar senha
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
            <div className="flex gap-3">
              <Button variant="navy" className="flex-1" onClick={() => setChangingPw(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gold" loading={pwLoading} className="flex-1">
                Salvar nova senha
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
            <History size={18} className="text-gray-300" />
          </div>
          <h2 className="font-heading font-semibold text-white">Acessos recentes</h2>
        </div>
        <p className="text-gray-500 text-xs mb-4">Últimas tentativas de login com o seu e-mail.</p>

        {failedLogins > 0 && (
          <div className="flex items-start gap-3 p-3 mb-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-gray-300 text-sm">
              {failedLogins} tentativa(s) com senha errada. Se não foi você, troque a senha e encerre as sessões
              em todos os aparelhos.
            </p>
          </div>
        )}

        {recentLogins.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum registro ainda.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {recentLogins.map((login, index) => (
              <li key={`${login.created_at}-${index}`} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="flex items-center gap-2">
                  {login.success ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <XCircle size={14} className="text-red-400" />
                  )}
                  <span className="text-gray-300">{login.success ? 'Login' : 'Senha incorreta'}</span>
                </span>
                <span className="text-gray-500 text-xs font-mono">{login.ip_address ?? '—'}</span>
                <span className="text-gray-400 text-xs">{formatDateTime(login.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
            <MonitorSmartphone size={18} className="text-gray-300" />
          </div>
          <h2 className="font-heading font-semibold text-white">Sessões</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="navy"
            size="sm"
            leftIcon={<LogOut size={14} />}
            loading={signingOut === 'local'}
            onClick={() => handleLogout('local')}
          >
            Sair deste aparelho
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut size={14} />}
            loading={signingOut === 'global'}
            onClick={() => handleLogout('global')}
          >
            Sair de todos os aparelhos
          </Button>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          Use &quot;todos os aparelhos&quot; se esqueceu o painel aberto em outro computador ou celular.
        </p>
      </div>
    </div>
  )
}
