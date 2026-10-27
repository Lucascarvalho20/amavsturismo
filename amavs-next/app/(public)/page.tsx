import HeroSection from '@/components/sections/HeroSection'
import ServicesStrip from '@/components/sections/ServicesStrip'
import AtestadosSection from '@/components/sections/AtestadosSection'
import StorytellingSection from '@/components/sections/StorytellingSection'
import FleetPreviewSection from '@/components/sections/FleetPreviewSection'
import FrotaFotosSection from '@/components/sections/FrotaFotosSection'
import StatsSection from '@/components/sections/StatsSection'
import WhyUsSection from '@/components/sections/WhyUsSection'
import GaleriaSection from '@/components/sections/GaleriaSection'
import ClientsSection from '@/components/sections/ClientsSection'
import CTASection from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesStrip />
      <AtestadosSection />
      <StorytellingSection />
      <FrotaFotosSection />
      <FleetPreviewSection />
      <StatsSection />
      <WhyUsSection />
      <GaleriaSection />
      <ClientsSection />
      <CTASection />
    </>
  )
}
