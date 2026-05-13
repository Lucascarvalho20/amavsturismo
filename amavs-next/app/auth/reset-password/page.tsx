'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Logo from '@/components/Logo'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Senha deve ter no mínimo 8 caracteres.'); return }
    if (password !== confirm) { toast.error('As senhas não coincidem.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Senha alterada com sucesso!')
    router.replace('/admin/login')
  }

  return (
    <div className="min-h-screen bg-navy-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-40" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo variant="full" size="lg" href="/" className="inline-flex justify-center mb-4" />
          <h1 className="font-heading font-bold text-white text-xl">Redefinir Senha</h1>
          <p className="text-gray-400 text-sm mt-1">Digite sua nova senha</p>
        </div>
        <div className="glass-dark rounded-2xl p-7 border border-gold/10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Lock size={16} className="text-gold" />
            </div>
            <span className="text-gray-300 text-sm font-medium">Nova senha</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nova senha" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Confirmar senha" type="password" placeholder="Repita a senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>Salvar nova senha</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
