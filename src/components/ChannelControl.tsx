'use client'

import { ChannelConfig } from '@/lib/audioGenerator'

interface ChannelControlProps {
  channel: ChannelConfig
  onChange: (updates: Partial<ChannelConfig>) => void
}

const channelDescriptions = {
  pink: 'Broadband 1/f spectrum masking foundation',
  speech: 'Speech-envelope matched noise with formant structure',
  babble: 'Multi-talker simulation with randomized characteristics',
  narrowband: 'Critical band noise targeting key speech frequencies'
}

const channelColors = {
  pink: 'bg-pink-100 border-pink-300',
  speech: 'bg-blue-100 border-blue-300',
  babble: 'bg-purple-100 border-purple-300',
  narrowband: 'bg-green-100 border-green-300'
}

export function ChannelControl({ channel, onChange }: ChannelControlProps) {
  return (
    <div className={`p-4 border-2 rounded-lg transition-all ${
      channel.enabled ? channelColors[channel.type] : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => onChange({ enabled: !channel.enabled })}
              className="flex items-center gap-2"
            >
              <span className="text-xl" role="img" aria-label={channel.enabled ? "volume on" : "volume off"}>
                {channel.enabled ? "🔊" : "🔇"}
              </span>
              <h3 className="font-semibold">{channel.name}</h3>
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {channelDescriptions[channel.type]}
          </p>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={channel.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {channel.enabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Level: {channel.level} dB</span>
            <span className="text-muted-foreground">
              {Math.round(Math.pow(10, channel.level / 20) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="0"
            step="1"
            value={channel.level}
            onChange={(e) => onChange({ level: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      )}
    </div>
  )
}

