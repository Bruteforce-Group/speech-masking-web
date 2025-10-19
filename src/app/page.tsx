'use client'

import { MaskingGenerator } from '@/components/MaskingGenerator'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <MaskingGenerator />
      </div>
      <Footer />
    </main>
  )
}

