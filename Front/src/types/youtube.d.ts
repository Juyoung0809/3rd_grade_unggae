declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface OnStateChangeEvent {
    data: number
    target: Player
  }

  interface OnReadyEvent {
    target: Player
  }

  interface PlayerOptions {
    events?: {
      onReady?: (event: OnReadyEvent) => void
      onStateChange?: (event: OnStateChangeEvent) => void
    }
  }

  class Player {
    constructor(elementId: string, options?: PlayerOptions)
    destroy(): void
    playVideo(): void
    pauseVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    getCurrentTime(): number
    getDuration(): number
    getPlayerState(): number
    setVolume(volume: number): void
    getVolume(): number
    mute(): void
    unMute(): void
    isMuted(): boolean
  }
}

interface Window {
  YT?: typeof YT
  onYouTubeIframeAPIReady?: () => void
}
