import type { Lecture } from '../api/lectures'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export function isYoutube(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

export function getYoutubeVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

/** 자체 컨트롤 UI에서 사용할 임베드 URL. 유튜브 기본 컨트롤/키보드/전체화면 버튼을 숨긴다. */
export function getYoutubeEmbedUrl(url: string): string | null {
  const videoId = getYoutubeVideoId(url)
  if (!videoId) return null
  const origin = encodeURIComponent(window.location.origin)
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${origin}&rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&playsinline=1`
}

export function getVideoSrc(lecture: Lecture): string {
  if (lecture.videoType === 'UPLOAD') {
    return lecture.videoUrl.startsWith('http')
      ? lecture.videoUrl
      : `${API_BASE}${lecture.videoUrl}`
  }
  return lecture.videoUrl
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
