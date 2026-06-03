import HeroSection from '@/components/sections/HeroSection'
import ServicesStrip from '@/components/sections/ServicesStrip'
import StorytellingSection from '@/components/sections/StorytellingSection'
import FleetPreviewSection from '@/components/sections/FleetPreviewSection'
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
      <StorytellingSection />
      <FleetPreviewSection />
      <StatsSection />
      <WhyUsSection />
      <GaleriaSection />
      <ClientsSection />
      <CTASection />
    </>
  )
}
