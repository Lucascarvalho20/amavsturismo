'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Key, ShieldCheck, ShieldOff, LogOut, CheckCircle, AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'

interface Props {
  userEmail: string
  userId: string
  createdAt: string
}

export default function ProfileClient({ userEmail, userId, createdAt }: Props) {
  const router = useRouter()
  const [changingPw, setChangingPw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (newPw.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    setPwLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      toast.success('Senha alterada com sucesso!')
      setChangingPw(false)
      setNewPw('')
      setConfirmPw('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar senha.')
    } finally {
      setPwLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
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
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400 text-sm">E-mail</span>
            <span className="text-white text-sm font-medium">{userEmail}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400 text-sm">ID do usuário</span>
            <span className="text-gray-500 text-xs font-mono">{userId.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400 text-sm">Conta criada em</span>
            <span className="text-white text-sm">
              {new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Key size={18} className="text-blue-400" />
          </div>
          <h2 className="font-heading font-semibold text-white">Senha</h2>
        </div>

        {!changingPw ? (
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">Use uma senha forte com pelo menos 8 caracteres.</p>
            <Button variant="outline" size="sm" onClick={() => setChangingPw(true)}>
              Alterar senha
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
            />
            <Input
              label="Confirmar nova senha"
              type="password"
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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gold/10 border border-gold/20 rounded-xl">
            <ShieldCheck size={18} className="text-gold" />
          </div>
          <h2 className="font-heading font-semibold text-white">Autenticação em 2 Fatores (2FA)</h2>
        </div>
        <div className="flex items-start gap-3 p-4 bg-gold/5 border border-gold/10 rounded-xl mb-4">
          <AlertTriangle size={16} className="text-gold mt-0.5 flex-shrink-0" />
          <p className="text-gray-300 text-sm">
            O 2FA adiciona uma camada extra de segurança. Quando ativado, você precisará de um código do app
            Google Authenticator a cada login.
          </p>
        </div>
        <Button as="a" href="/admin/setup-mfa" variant="outline" size="sm" leftIcon={<ShieldCheck size={14} />}>
          Configurar 2FA (recomendado)
        </Button>
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-white mb-1">Encerrar Sessão</h2>
            <p className="text-gray-400 text-sm">Sair do painel administrativo.</p>
          </div>
          <Button
            variant="navy"
            size="sm"
            leftIcon={<LogOut size={14} />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
