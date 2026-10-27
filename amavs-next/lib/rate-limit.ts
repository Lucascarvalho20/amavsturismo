// Rate limit em memória (best effort): cada instância serverless tem seu próprio contador.
// Suficiente para barrar spam de formulário vindo de um mesmo IP; o banco tem
// verificações adicionais por telefone/e-mail nas rotas que gravam dados.

const buckets = new Map<string, number[]>()

export function hitRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  buckets.set(key, recent)

  if (buckets.size > 5000) {
    buckets.forEach((v, k) => {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k)
    })
  }
  return recent.length > max
}
