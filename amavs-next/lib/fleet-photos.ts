import type { VehicleCategory } from './types'

// Fotos reais da frota (recuperadas do site antigo, otimizadas e sem metadados EXIF/GPS).
// Ficam em /public/images/frota — cada foto tem uma versão "-sm" (720px) para cards.
// Quando um veículo ganhar foto própria no admin (Supabase Storage), ela tem prioridade.

export interface FleetPhoto {
  src: string
  srcSm: string
  alt: string
  caption: string
  category: VehicleCategory | 'frota' | 'interior'
}

function photo(file: string, alt: string, caption: string, category: FleetPhoto['category']): FleetPhoto {
  return {
    src: `/images/frota/${file}.jpg`,
    srcSm: `/images/frota/${file}-sm.jpg`,
    alt,
    caption,
    category,
  }
}

export const fleetPhotos: FleetPhoto[] = [
  photo('frota-garagem', "Frota da Amav's Turismo estacionada na garagem", 'Frota própria em garagem coberta', 'frota'),
  photo('onibus-rodoviario-lateral', 'Ônibus rodoviário da Amav\'s Turismo, vista lateral', 'Ônibus rodoviário', 'onibus'),
  photo('micro-comboio', 'Comboio de micro-ônibus da Amav\'s Turismo', 'Comboio para evento institucional', 'micro'),
  photo('onibus-viagem', 'Ônibus da Amav\'s Turismo em viagem, à beira do rio', 'Viagens interestaduais', 'onibus'),
  photo('micro-motorista', 'Motorista uniformizado ao lado de micro-ônibus', 'Motoristas uniformizados', 'micro'),
  photo('interior-onibus', 'Interior de ônibus com poltronas reclináveis', 'Poltronas reclináveis', 'interior'),
  photo('onibus-rodoviario-34', 'Ônibus rodoviário em vista três-quartos', 'Ônibus de turismo', 'onibus'),
  photo('micro-volare', 'Micro-ônibus executivo Volare', 'Micro-ônibus executivo', 'micro'),
  photo('interior-micro', 'Interior de micro-ônibus com capas de poltrona personalizadas', 'Interior do micro-ônibus', 'interior'),
  photo('onibus-estrada', 'Ônibus da Amav\'s Turismo na estrada', 'Na estrada', 'onibus'),
  photo('micro-volare-frente', 'Micro-ônibus Volare de frente na garagem', 'Manutenção em garagem própria', 'micro'),
  photo('interior-executivo', 'Interior executivo com frigobar', 'Interior executivo', 'interior'),
  photo('onibus-hotel', 'Ônibus em frente a hotel', 'Traslado hotel–evento', 'onibus'),
  photo('interior-executivo-couro', 'Interior de ônibus executivo com poltronas de couro', 'Executivo com poltronas de couro', 'interior'),
  photo('micro-volare-34', 'Micro-ônibus Volare em vista três-quartos', 'Micro-ônibus Volare', 'micro'),
  photo('onibus-rodoviario-perfil', 'Ônibus rodoviário de perfil no pátio', 'Ônibus rodoviário', 'onibus'),
  photo('micro-acessivel', 'Micro-ônibus com identificação de acessibilidade', 'Acessibilidade', 'micro'),
  photo('interior-poltronas-couro', 'Poltronas de couro reclináveis', 'Conforto em viagens longas', 'interior'),
  photo('onibus-garagem', 'Ônibus rodoviário na garagem da empresa', 'Garagem própria', 'onibus'),
  photo('micro-porta-aberta', 'Micro-ônibus com porta de embarque aberta', 'Embarque', 'micro'),
  photo('interior-micro-executivo', 'Interior de micro-ônibus executivo com frigobar', 'Micro executivo', 'interior'),
  photo('bagageiro', 'Bagageiro do ônibus aberto', 'Bagageiro amplo', 'interior'),
]

const byCategory = (c: FleetPhoto['category']) => fleetPhotos.filter((p) => p.category === c)

/** Foto real usada quando o veículo ainda não tem foto cadastrada no admin. */
export function fallbackPhotoFor(category: VehicleCategory, index = 0): string | null {
  const pool = byCategory(category)
  if (pool.length === 0) return null
  return pool[index % pool.length].srcSm
}

/** Slides do hero quando não há imagens configuradas no admin. */
export const heroFallbackSlides = [
  { image_url: '/images/frota/frota-garagem.jpg', title: 'Frota própria', subtitle: 'Garagem e manutenção próprias em Brasília', meta: 'Estrutura' },
  { image_url: '/images/frota/micro-comboio.jpg', title: 'Operações em comboio', subtitle: 'Eventos oficiais e institucionais', meta: 'Setor público' },
  { image_url: '/images/frota/onibus-rodoviario-lateral.jpg', title: 'Ônibus rodoviário', subtitle: 'Viagens interestaduais', meta: 'Ônibus' },
  { image_url: '/images/frota/micro-motorista.jpg', title: 'Motoristas uniformizados', subtitle: 'Equipe treinada para protocolos oficiais', meta: 'Equipe' },
]
