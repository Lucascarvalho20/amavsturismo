import HeroSection from '@/components/sections/HeroSection'
import ServicesStrip from '@/components/sections/ServicesStrip'
import FleetPreviewSection from '@/components/sections/FleetPreviewSection'
import StatsSection from '@/components/sections/StatsSection'
import WhyUsSection from '@/components/sections/WhyUsSection'
import ClientsSection from '@/components/sections/ClientsSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import CTASection from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesStrip />
      <FleetPreviewSection />
      <StatsSection />
      <WhyUsSection />
      <ClientsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
