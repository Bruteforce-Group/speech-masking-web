'use client'

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <span className="text-2xl" role="img" aria-label="waveform">🎵</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Speech Masking Generator
              </h1>
              <p className="text-sm text-muted-foreground">
                Browser-based research audio tool
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <div className="text-right">
              <div className="font-semibold text-gray-900">48 kHz</div>
              <div>Professional Quality</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">4 Channels</div>
              <div>Individual Control</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">Instant</div>
              <div>Browser-based</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

