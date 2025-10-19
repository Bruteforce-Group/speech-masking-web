'use client'

export function Footer() {
  return (
    <footer className="border-t bg-white mt-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground">
              Research-grade speech masking signal generator built with Web Audio API.
              Perfect for acoustic testing and speech intelligibility research.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Signal Types</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pink Noise (1/f spectrum)</li>
              <li>• Speech-Shaped Noise</li>
              <li>• Multi-Talker Babble</li>
              <li>• Narrowband Maskers</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Individual channel control</li>
              <li>• Mono & stereo export</li>
              <li>• Configurable sample rates</li>
              <li>• No server processing needed</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            Made with <span className="text-red-500">❤️</span> for research
          </div>
          
          <div className="flex items-center gap-4">
            <span>© 2025 Speech Masking Generator</span>
            <span>•</span>
            <a 
              href="https://github.com" 
              className="hover:text-gray-900 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

