'use client'

import { useState, useRef, useEffect } from 'react'
import { AudioMaskingGenerator, ChannelConfig } from '@/lib/audioGenerator'
import { downloadBlob, formatBytes } from '@/lib/utils'
import { ChannelControl } from './ChannelControl'
import { Button } from './Button'
import { Card } from './Card'

export function MaskingGenerator() {
  const [duration, setDuration] = useState(60)
  const [sampleRate, setSampleRate] = useState(48000)
  const [channels, setChannels] = useState<ChannelConfig[]>([
    { type: 'pink', enabled: true, level: -10, name: 'Pink Noise' },
    { type: 'speech', enabled: true, level: -6, name: 'Speech-Shaped' },
    { type: 'babble', enabled: true, level: -8, name: 'Babble (6 voices)' },
    { type: 'narrowband', enabled: true, level: -12, name: 'Narrowband Maskers' },
  ])
  const [generating, setGenerating] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedAudio, setGeneratedAudio] = useState<Float32Array | null>(null)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)

  const handleChannelChange = (index: number, updates: Partial<ChannelConfig>) => {
    setChannels(prev => prev.map((ch, i) => i === index ? { ...ch, ...updates } : ch))
  }

  const generateSignal = async () => {
    setGenerating(true)
    setProgress(0)
    
    try {
      const generator = new AudioMaskingGenerator(sampleRate)
      const generatedChannels = new Map<string, Float32Array>()
      const levels = new Map<string, number>()
      
      let completed = 0
      const total = channels.filter(ch => ch.enabled).length
      
      for (const channel of channels) {
        if (!channel.enabled) continue
        
        let signal: Float32Array
        
        switch (channel.type) {
          case 'pink':
            signal = generator.generatePinkNoise(duration)
            break
          case 'speech':
            signal = generator.generateSpeechShapedNoise(duration)
            break
          case 'babble':
            signal = generator.generateBabble(duration, 6)
            break
          case 'narrowband':
            signal = generator.generateNarrowbandMaskers(duration)
            break
          default:
            continue
        }
        
        generatedChannels.set(channel.type, signal)
        levels.set(channel.type, channel.level)
        
        completed++
        setProgress((completed / total) * 100)
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      // Mix channels
      const mixed = generator.mixChannels(generatedChannels, levels)
      setGeneratedAudio(mixed)
      
      generator.dispose()
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate audio. Please try again.')
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

  const playAudio = () => {
    if (!generatedAudio) return
    
    if (playing) {
      sourceNodeRef.current?.stop()
      setPlaying(false)
      return
    }
    
    const audioCtx = new AudioContext({ sampleRate })
    const buffer = audioCtx.createBuffer(1, generatedAudio.length, sampleRate)
    buffer.copyToChannel(generatedAudio, 0)
    
    const source = audioCtx.createBufferSource()
    source.buffer = buffer
    source.connect(audioCtx.destination)
    source.onended = () => setPlaying(false)
    source.start()
    
    audioContextRef.current = audioCtx
    sourceNodeRef.current = source
    setPlaying(true)
  }

  const downloadAudio = (format: 'mono' | 'stereo') => {
    if (!generatedAudio) return
    
    const generator = new AudioMaskingGenerator(sampleRate)
    
    let audioData: Float32Array[]
    let filename: string
    
    if (format === 'stereo') {
      audioData = generator.createStereo(generatedAudio)
      filename = 'masking_stereo.wav'
    } else {
      audioData = [generatedAudio]
      filename = 'masking_mono.wav'
    }
    
    const blob = generator.exportToWav(audioData, sampleRate)
    downloadBlob(blob, filename)
    
    generator.dispose()
  }

  useEffect(() => {
    return () => {
      sourceNodeRef.current?.stop()
      audioContextRef.current?.close()
    }
  }, [])

  const estimatedSize = Math.floor((sampleRate * duration * 2) / 1024 / 1024) // 16-bit mono

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl" role="img" aria-label="settings">⚙️</span>
          <h2 className="text-xl font-semibold">Configuration</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              max="300"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Estimated size: ~{estimatedSize} MB (mono)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Sample Rate (Hz)
            </label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={44100}>44,100 Hz (CD Quality)</option>
              <option value={48000}>48,000 Hz (Professional)</option>
              <option value={96000}>96,000 Hz (Hi-Res)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Channels */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Masking Channels</h2>
        <div className="space-y-4">
          {channels.map((channel, index) => (
            <ChannelControl
              key={channel.type}
              channel={channel}
              onChange={(updates) => handleChannelChange(index, updates)}
            />
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={generateSignal}
            disabled={generating || !channels.some(ch => ch.enabled)}
            variant="primary"
            size="lg"
          >
            {generating ? (
              <>
                <span className="mr-2">⏳</span>
                Generating... {Math.round(progress)}%
              </>
            ) : (
              '🎵 Generate Signal'
            )}
          </Button>

          {generatedAudio && (
            <>
              <Button
                onClick={playAudio}
                variant="secondary"
                size="lg"
              >
                {playing ? '⏸️ Stop' : '▶️ Play Preview'}
              </Button>

              <Button
                onClick={() => downloadAudio('mono')}
                variant="secondary"
                size="lg"
              >
                ⬇️ Download Mono
              </Button>

              <Button
                onClick={() => downloadAudio('stereo')}
                variant="secondary"
                size="lg"
              >
                ⬇️ Download Stereo
              </Button>
            </>
          )}
        </div>

        {generatedAudio && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Audio generated successfully! Duration: {duration}s, Sample Rate: {sampleRate/1000}kHz
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

