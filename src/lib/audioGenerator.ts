/**
 * Web Audio API Speech Masking Signal Generator
 * Browser-based implementation of research-grade masking signals
 */

export interface MaskingConfig {
  sampleRate: number;
  duration: number;
  channels: ChannelConfig[];
}

export interface ChannelConfig {
  type: 'pink' | 'speech' | 'babble' | 'narrowband';
  enabled: boolean;
  level: number; // -20 to 0 dB
  name: string;
}

export class AudioMaskingGenerator {
  private audioContext: AudioContext;
  private sampleRate: number;

  constructor(sampleRate: number = 48000) {
    this.audioContext = new AudioContext({ sampleRate });
    this.sampleRate = sampleRate;
  }

  /**
   * Generate pink noise using the Voss-McCartney algorithm
   */
  generatePinkNoise(duration: number): Float32Array {
    const samples = Math.floor(this.sampleRate * duration);
    const output = new Float32Array(samples);
    
    // Pink noise using running sum of random generators
    const numGenerators = 16;
    const generators = new Array(numGenerators).fill(0);
    let maxKey = 0x1;
    
    for (let i = 0; i < samples; i++) {
      let sum = 0;
      
      // Update random generators
      const key = i;
      for (let j = 0; j < numGenerators; j++) {
        if (key & (1 << j)) {
          generators[j] = Math.random() * 2 - 1;
        }
        sum += generators[j];
      }
      
      output[i] = sum / numGenerators;
    }
    
    // Normalize
    return this.normalize(output, 0.5);
  }

  /**
   * Generate speech-shaped noise with formant structure
   */
  generateSpeechShapedNoise(duration: number): Float32Array {
    const samples = Math.floor(this.sampleRate * duration);
    const white = this.generateWhiteNoise(samples);
    
    // Apply formant filters using biquad approximation
    const formants = [
      { freq: 700, q: 5.4 },   // F1
      { freq: 1220, q: 17.4 }, // F2
      { freq: 2600, q: 16.3 }, // F3
    ];
    
    let filtered = new Float32Array(white);
    
    // Apply each formant filter
    for (const formant of formants) {
      filtered = this.applyBandpassFilter(filtered, formant.freq, formant.q);
    }
    
    // Apply envelope modulation (syllabic rate ~8 Hz)
    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      const modulator = 1 + 0.3 * Math.sin(2 * Math.PI * 8 * t);
      filtered[i] *= modulator;
    }
    
    return this.normalize(filtered, 0.6);
  }

  /**
   * Generate multi-talker babble simulation
   */
  generateBabble(duration: number, numVoices: number = 6): Float32Array {
    const samples = Math.floor(this.sampleRate * duration);
    const output = new Float32Array(samples);
    
    for (let voice = 0; voice < numVoices; voice++) {
      const voiceSignal = this.generateWhiteNoise(samples);
      
      // Randomize formant frequencies for each voice
      const f1 = 700 * (1 + 0.3 * (Math.random() - 0.5));
      const f2 = 1220 * (1 + 0.3 * (Math.random() - 0.5));
      const f3 = 2600 * (1 + 0.3 * (Math.random() - 0.5));
      
      // Apply formant filters
      let filtered = this.applyBandpassFilter(voiceSignal, f1, 5);
      filtered = this.applyBandpassFilter(filtered, f2, 15);
      filtered = this.applyBandpassFilter(filtered, f3, 15);
      
      // Random amplitude
      const amplitude = 0.7 + Math.random() * 0.3;
      
      // Add to mix
      for (let i = 0; i < samples; i++) {
        output[i] += filtered[i] * amplitude;
      }
    }
    
    return this.normalize(output, 0.5);
  }

  /**
   * Generate narrowband maskers targeting critical speech bands
   */
  generateNarrowbandMaskers(duration: number): Float32Array {
    const samples = Math.floor(this.sampleRate * duration);
    const output = new Float32Array(samples);
    
    const bands = [
      { center: 250, width: 100 },   // Low formants
      { center: 650, width: 300 },   // F1 region
      { center: 1250, width: 500 },  // F2 region
      { center: 2500, width: 1000 }, // F3 region
      { center: 3500, width: 1000 }, // Sibilants
    ];
    
    for (const band of bands) {
      const bandNoise = this.generateWhiteNoise(samples);
      const filtered = this.applyBandpassFilter(bandNoise, band.center, band.center / band.width);
      
      // Weight by importance (boost mid frequencies)
      const weight = (band.center >= 500 && band.center <= 2000) ? 1.5 : 1.0;
      
      for (let i = 0; i < samples; i++) {
        output[i] += filtered[i] * weight;
      }
    }
    
    return this.normalize(output, 0.3);
  }

  /**
   * Mix channels with level control
   */
  mixChannels(channels: Map<string, Float32Array>, levels: Map<string, number>): Float32Array {
    const samples = channels.values().next().value.length;
    const output = new Float32Array(samples);
    
    for (const [name, signal] of channels.entries()) {
      const levelDb = levels.get(name) || 0;
      const levelLinear = Math.pow(10, levelDb / 20);
      
      for (let i = 0; i < samples; i++) {
        output[i] += signal[i] * levelLinear;
      }
    }
    
    return this.normalize(output, 0.95);
  }

  /**
   * Create stereo with spatial decorrelation
   */
  createStereo(mono: Float32Array): Float32Array[] {
    const samples = mono.length;
    const left = new Float32Array(mono);
    const right = new Float32Array(samples);
    
    // Apply Hilbert transform approximation for phase shift
    const delaySamples = Math.floor(0.0005 * this.sampleRate); // 0.5ms ITD
    
    for (let i = 0; i < samples; i++) {
      if (i >= delaySamples) {
        // Phase-shifted and delayed right channel
        right[i] = mono[i - delaySamples];
      } else {
        right[i] = mono[i];
      }
    }
    
    // Apply 45° phase rotation approximation
    const alpha = 0.707; // cos(45°)
    for (let i = 1; i < samples; i++) {
      right[i] = alpha * right[i] + (1 - alpha) * right[i - 1];
    }
    
    return [left, right];
  }

  /**
   * Export to WAV format
   */
  exportToWav(audioData: Float32Array[], sampleRate: number): Blob {
    const numChannels = audioData.length;
    const numSamples = audioData[0].length;
    const bytesPerSample = 2; // 16-bit
    
    const buffer = new ArrayBuffer(44 + numSamples * numChannels * bytesPerSample);
    const view = new DataView(buffer);
    
    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * numChannels * bytesPerSample, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // PCM format
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, 8 * bytesPerSample, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, numSamples * numChannels * bytesPerSample, true);
    
    // Audio data
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, audioData[ch][i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  // Helper methods
  
  private generateWhiteNoise(samples: number): Float32Array {
    const output = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return output;
  }

  private applyBandpassFilter(input: Float32Array, freq: number, q: number): Float32Array {
    const output = new Float32Array(input.length);
    const w0 = 2 * Math.PI * freq / this.sampleRate;
    const alpha = Math.sin(w0) / (2 * q);
    
    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;
    
    // Apply biquad filter
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    
    for (let i = 0; i < input.length; i++) {
      const x0 = input[i];
      const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      
      output[i] = y0;
      
      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;
    }
    
    return output;
  }

  private normalize(data: Float32Array, targetLevel: number): Float32Array {
    let max = 0;
    for (let i = 0; i < data.length; i++) {
      max = Math.max(max, Math.abs(data[i]));
    }
    
    if (max > 0) {
      const scale = targetLevel / max;
      for (let i = 0; i < data.length; i++) {
        data[i] *= scale;
      }
    }
    
    return data;
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  dispose() {
    this.audioContext.close();
  }
}

