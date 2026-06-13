import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, SyntheticEvent } from 'react'
import type { Lecture } from '../api/lectures'
import { isYoutube, getYoutubeEmbedUrl, getVideoSrc, formatTime } from '../utils/video'
import {
  PlayIcon,
  PauseIcon,
  VolumeIcon,
  MuteIcon,
  FullscreenIcon,
  ExitFullscreenIcon,
} from './PlayerIcons'

interface CourseVideoPlayerProps {
  lecture: Lecture
  /** 이미 완료한 강의인 경우 전체 구간 자유 탐색을 허용한다. */
  completed: boolean
  onEnded: () => void
}

/**
 * 유튜브/업로드 영상 공용 커스텀 플레이어.
 * 유튜브 자체 컨트롤(건너뛰기, 배속, 전체화면 등)을 숨기고 사이트 자체 컨트롤로 대체한다.
 * "본 구간까지만 자유 이동" 정책에 따라 maxWatched를 넘어선 탐색은 막는다.
 */
export default function CourseVideoPlayer({ lecture, completed, onEnded }: CourseVideoPlayerProps) {
  const isYT = isYoutube(lecture.videoUrl)
  const embedUrl = isYT ? getYoutubeEmbedUrl(lecture.videoUrl) : null

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const [maxWatched, setMaxWatched] = useState(completed ? Infinity : 0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const lastSeekRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | undefined>(undefined)
  const onEndedRef = useRef(onEnded)

  useEffect(() => { onEndedRef.current = onEnded }, [onEnded])

  const seekLimit = Number.isFinite(maxWatched) ? maxWatched : duration

  // ── 유튜브 IFrame API 로드 + 플레이어 생성 (종료 감지, 진행률 폴링) ──
  useEffect(() => {
    if (!isYT || !embedUrl) return
    let cancelled = false
    let pollId: number | undefined

    function attachPolling() {
      pollId = window.setInterval(() => {
        const p = playerRef.current
        if (!p) return
        try {
          const t = p.getCurrentTime()
          const d = p.getDuration()
          setCurrentTime(t)
          if (d > 0) setDuration(d)
          setMaxWatched(prev => (prev === Infinity ? prev : Math.max(prev, t)))
        } catch {
          // 플레이어 준비 전 호출은 무시
        }
      }, 500)
    }

    function createPlayer() {
      if (cancelled || !window.YT?.Player) return
      playerRef.current = new window.YT.Player('yt-iframe-player', {
        events: {
          onReady: (event) => {
            setDuration(event.target.getDuration())
            event.target.setVolume(volume)
          },
          onStateChange: (event) => {
            const PS = window.YT!.PlayerState
            // 재생/일시정지 상태는 togglePlay가 직접 관리한다.
            // 유튜브가 비동기로 보내는 PLAYING/PAUSED 이벤트까지 그대로 반영하면
            // pauseVideo() 직후 잠깐 PLAYING이 다시 전달되어 일시정지 커버가 사라지는 문제가 있었다.
            if (event.data === PS.ENDED) {
              setMaxWatched(Infinity)
              setPlaying(false)
              onEndedRef.current()
            }
          },
        },
      })
      attachPolling()
    }

    if (window.YT?.Player) {
      createPlayer()
    } else {
      if (!document.getElementById('youtube-iframe-api')) {
        const script = document.createElement('script')
        script.id = 'youtube-iframe-api'
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }
      const prevReady = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prevReady?.()
        createPlayer()
      }
    }

    return () => {
      cancelled = true
      if (pollId) window.clearInterval(pollId)
      playerRef.current?.destroy()
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYT, embedUrl])

  // ── 전체화면 상태 추적 ──
  useEffect(() => {
    function handleChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  // ── 재생 중 일정 시간 후 컨트롤 바 자동 숨김 ──
  const scheduleHideControls = useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), 2500)
  }, [])

  useEffect(() => {
    if (playing) {
      scheduleHideControls()
    } else {
      setControlsVisible(true)
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    }
    return () => { if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current) }
  }, [playing, scheduleHideControls])

  function handleMouseMove() {
    setControlsVisible(true)
    if (playing) scheduleHideControls()
  }

  // ── 재생/일시정지 ──
  function togglePlay() {
    if (isYT) {
      const p = playerRef.current
      if (!p) return
      if (playing) {
        p.pauseVideo()
        setPlaying(false)
      } else {
        p.playVideo()
        setPlaying(true)
      }
    } else {
      const v = videoRef.current
      if (!v) return
      if (v.paused) v.play()
      else v.pause()
    }
  }

  // ── 탐색 (본 구간까지만 허용) ──
  function seekTo(time: number) {
    const clamped = Math.max(0, Math.min(time, seekLimit))
    setCurrentTime(clamped)
    // 시청 한계 지점 등 동일한 위치로 반복 탐색 요청이 들어오면(드래그 중 등) 실제 seek는 건너뛴다.
    // 그렇지 않으면 같은 지점으로 계속 seekTo가 호출되어 오디오가 끊겨 반복 재생되는 문제가 발생한다.
    if (lastSeekRef.current !== null && Math.abs(clamped - lastSeekRef.current) < 0.1) return
    lastSeekRef.current = clamped
    if (isYT) {
      playerRef.current?.seekTo(clamped, true)
    } else if (videoRef.current) {
      videoRef.current.currentTime = clamped
    }
  }

  function handleProgressInteraction(clientX: number) {
    const bar = progressBarRef.current
    if (!bar || duration <= 0) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    seekTo(ratio * duration)
  }

  function onProgressPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    handleProgressInteraction(e.clientX)
  }
  function onProgressPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    handleProgressInteraction(e.clientX)
  }
  function onProgressPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  // ── 볼륨 ──
  function handleVolumeChange(value: number) {
    setVolume(value)
    const nextMuted = value === 0
    setMuted(nextMuted)
    if (isYT) {
      playerRef.current?.setVolume(value)
      if (nextMuted) playerRef.current?.mute()
      else playerRef.current?.unMute()
    } else if (videoRef.current) {
      videoRef.current.volume = value / 100
      videoRef.current.muted = nextMuted
    }
  }

  function toggleMute() {
    if (muted || volume === 0) {
      const restored = volume === 0 ? 50 : volume
      setMuted(false)
      setVolume(restored)
      if (isYT) {
        playerRef.current?.unMute()
        playerRef.current?.setVolume(restored)
      } else if (videoRef.current) {
        videoRef.current.muted = false
        videoRef.current.volume = restored / 100
      }
    } else {
      setMuted(true)
      if (isYT) playerRef.current?.mute()
      else if (videoRef.current) videoRef.current.muted = true
    }
  }

  // ── 전체화면 ──
  function toggleFullscreen() {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }

  // ── 업로드 영상 이벤트 ──
  function handleTimeUpdate(e: SyntheticEvent<HTMLVideoElement>) {
    const t = e.currentTarget.currentTime
    setCurrentTime(t)
    setMaxWatched(prev => (prev === Infinity ? prev : Math.max(prev, t)))
  }

  function handleLoadedMetadata(e: SyntheticEvent<HTMLVideoElement>) {
    setDuration(e.currentTarget.duration)
    e.currentTarget.volume = volume / 100
  }

  function handleSeeking(e: SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget
    if (v.currentTime > seekLimit + 0.5) v.currentTime = seekLimit
  }

  function handleRateChange(e: SyntheticEvent<HTMLVideoElement>) {
    if (e.currentTarget.playbackRate !== 1) e.currentTarget.playbackRate = 1
  }

  function handleEnded() {
    setPlaying(false)
    setMaxWatched(Infinity)
    onEndedRef.current()
  }

  const watchedPercent = duration > 0 ? Math.min(100, (Math.min(maxWatched, duration) / duration) * 100) : 0
  const playedPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div
      ref={containerRef}
      className="bg-black w-full relative"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      {isYT && embedUrl ? (
        <iframe
          id="yt-iframe-player"
          src={embedUrl}
          className={`absolute inset-0 w-full h-full pointer-events-none ${playing ? '' : 'opacity-0'}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          tabIndex={-1}
        />
      ) : isYT && !embedUrl ? (
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
          유효하지 않은 YouTube URL입니다.
        </div>
      ) : (
        <video
          ref={videoRef}
          src={getVideoSrc(lecture)}
          className="absolute inset-0 w-full h-full"
          playsInline
          disablePictureInPicture
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
          onSeeking={handleSeeking}
          onRateChange={handleRateChange}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      {/* 네이티브 인터랙션 차단 + 클릭 재생/일시정지 */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
      />

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <PlayIcon className="w-8 h-8 text-white" />
          </div>
        </div>
      )}

      {/* 커스텀 컨트롤 바 */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 pb-3 pt-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          ref={progressBarRef}
          className="relative h-1.5 rounded-full bg-white/25 cursor-pointer mb-3 touch-none"
          onPointerDown={onProgressPointerDown}
          onPointerMove={onProgressPointerMove}
          onPointerUp={onProgressPointerUp}
        >
          <div className="absolute inset-y-0 left-0 bg-white/40 rounded-full" style={{ width: `${watchedPercent}%` }} />
          <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full" style={{ width: `${playedPercent}%` }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full shadow"
            style={{ left: `${playedPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-3 text-white">
          <button onClick={togglePlay} className="hover:text-indigo-300 transition-colors" aria-label={playing ? '일시정지' : '재생'}>
            {playing ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>

          <button onClick={toggleMute} className="hover:text-indigo-300 transition-colors" aria-label={muted || volume === 0 ? '음소거 해제' : '음소거'}>
            {muted || volume === 0 ? <MuteIcon className="w-5 h-5" /> : <VolumeIcon className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-20 accent-indigo-500"
            aria-label="볼륨"
          />

          <span className="text-xs tabular-nums text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button onClick={toggleFullscreen} className="hover:text-indigo-300 transition-colors" aria-label={isFullscreen ? '전체화면 종료' : '전체화면'}>
            {isFullscreen ? <ExitFullscreenIcon className="w-5 h-5" /> : <FullscreenIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
