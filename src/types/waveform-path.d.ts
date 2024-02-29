declare module 'waveform-path' {
  export function getAudioData(url: string): Promise<AudioBuffer>
  export function linearPath(audioBuffer: AudioBuffer, options: object): string
}
