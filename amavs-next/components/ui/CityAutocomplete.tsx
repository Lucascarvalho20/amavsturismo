'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CIDADES_BR = [
  'Brasília, DF', 'Taguatinga, DF', 'Ceilândia, DF', 'Samambaia, DF', 'Águas Claras, DF',
  'Gama, DF', 'Sobradinho, DF', 'Planaltina, DF', 'Guará, DF', 'Santa Maria, DF',
  // GO
  'Goiânia, GO', 'Aparecida de Goiânia, GO', 'Anápolis, GO', 'Rio Verde, GO',
  'Luziânia, GO', 'Águas Lindas de Goiás, GO', 'Valparaíso de Goiás, GO',
  'Trindade, GO', 'Formosa, GO', 'Novo Gama, GO', 'Caldas Novas, GO',
  'Pirenópolis, GO', 'Chapada dos Veadeiros, GO', 'Alto Paraíso de Goiás, GO',
  // SP
  'São Paulo, SP', 'Campinas, SP', 'Ribeirão Preto, SP', 'Santo André, SP',
  'São Bernardo do Campo, SP', 'Sorocaba, SP', 'Santos, SP', 'Guarulhos, SP',
  'Osasco, SP', 'Mauá, SP', 'São José dos Campos, SP', 'Bauru, SP',
  // RJ
  'Rio de Janeiro, RJ', 'São Gonçalo, RJ', 'Duque de Caxias, RJ', 'Nova Iguaçu, RJ',
  'Niterói, RJ', 'Belford Roxo, RJ', 'Petrópolis, RJ', 'Angra dos Reis, RJ',
  'Búzios, RJ', 'Paraty, RJ',
  // MG
  'Belo Horizonte, MG', 'Uberlândia, MG', 'Contagem, MG', 'Juiz de Fora, MG',
  'Betim, MG', 'Montes Claros, MG', 'Uberaba, MG', 'Ouro Preto, MG',
  'Diamantina, MG', 'Tiradentes, MG', 'São João del-Rei, MG', 'Caxambu, MG',
  // BA
  'Salvador, BA', 'Feira de Santana, BA', 'Vitória da Conquista, BA',
  'Camaçari, BA', 'Ilhéus, BA', 'Porto Seguro, BA', 'Morro de São Paulo, BA',
  'Chapada Diamantina, BA', 'Lençóis, BA',
  // PE
  'Recife, PE', 'Caruaru, PE', 'Olinda, PE', 'Petrolina, PE', 'Porto de Galinhas, PE',
  // CE
  'Fortaleza, CE', 'Juazeiro do Norte, CE', 'Caucaia, CE', 'Maracanaú, CE',
  'Canoa Quebrada, CE', 'Jericoacoara, CE',
  // RS
  'Porto Alegre, RS', 'Caxias do Sul, RS', 'Pelotas, RS', 'Canoas, RS',
  'Santa Maria, RS', 'Gramado, RS', 'Canela, RS', 'Bento Gonçalves, RS',
  // SC
  'Florianópolis, SC', 'Joinville, SC', 'Blumenau, SC', 'São José, SC',
  'Balneário Camboriú, SC', 'Bombinhas, SC',
  // PR
  'Curitiba, PR', 'Londrina, PR', 'Maringá, PR', 'Foz do Iguaçu, PR',
  'Cascavel, PR', 'Morretes, PR', 'Antonina, PR',
  // MT / MS
  'Cuiabá, MT', 'Várzea Grande, MT', 'Chapada dos Guimarães, MT',
  'Campo Grande, MS', 'Dourados, MS', 'Bonito, MS',
  // PA
  'Belém, PA', 'Ananindeua, PA', 'Santarém, PA', 'Marabá, PA',
  'Alter do Chão, PA',
  // AM
  'Manaus, AM', 'Parintins, AM',
  // MA
  'São Luís, MA', 'Imperatriz, MA', 'Barreirinhas, MA', 'Lençóis Maranhenses, MA',
  // PI
  'Teresina, PI', 'Parnaíba, PI', 'Sete Cidades, PI',
  // RN
  'Natal, RN', 'Mossoró, RN', 'Pipa, RN',
  // PB
  'João Pessoa, PB', 'Campina Grande, PB',
  // AL
  'Maceió, AL', 'Arapiraca, AL',
  // SE
  'Aracaju, SE',
  // ES
  'Vitória, ES', 'Serra, ES', 'Guarapari, ES',
  // TO
  'Palmas, TO', 'Araguaína, TO',
  // RO
  'Porto Velho, RO',
  // AP
  'Macapá, AP',
  // AC
  'Rio Branco, AC',
  // RR
  'Boa Vista, RR',
].sort()

interface CityAutocompleteProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  allowAnywhere?: boolean
  className?: string
}

const CityAutocomplete = forwardRef<HTMLInputElement, CityAutocompleteProps>(
  function CityAutocomplete({ label, value, onChange, placeholder, required, error, className }, ref) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState(value)
    const containerRef = useRef<HTMLDivElement>(null)
    const [highlighted, setHighlighted] = useState(0)

    const suggestions = query.length >= 2
      ? CIDADES_BR.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
      : []

    useEffect(() => {
      setQuery(value)
    }, [value])

    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const select = (city: string) => {
      setQuery(city)
      onChange(city)
      setOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!open || suggestions.length === 0) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, suggestions.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); if (suggestions[highlighted]) select(suggestions[highlighted]) }
      if (e.key === 'Escape') setOpen(false)
    }

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="relative">
          <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            ref={ref}
            type="text"
            value={query}
            placeholder={placeholder}
            required={required}
            autoComplete="off"
            className={cn(
              'w-full bg-navy-100 border rounded-lg pl-9 pr-8 py-2.5 text-sm text-gray-200 placeholder-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-colors',
              error ? 'border-red-500/50' : 'border-white/10',
            )}
            onChange={(e) => {
              setQuery(e.target.value)
              onChange(e.target.value)
              setOpen(true)
              setHighlighted(0)
            }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); onChange(''); setOpen(false) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-navy-100 border border-white/10 rounded-xl overflow-hidden shadow-glass max-h-52 overflow-y-auto scrollbar-thin">
            {suggestions.map((city, i) => (
              <li key={city}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => select(city)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors',
                    i === highlighted ? 'bg-gold/10 text-gold' : 'text-gray-300 hover:bg-white/5',
                  )}
                >
                  <MapPin size={13} className="flex-shrink-0 opacity-60" />
                  {city}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)

export default CityAutocomplete
