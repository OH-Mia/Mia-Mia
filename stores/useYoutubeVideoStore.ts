import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface YoutubeVideoItem {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  viewCount?: string
}

export const useYoutubeVideoStore = defineStore('youtubeVideo', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const videoCache = ref<Record<string, YoutubeVideoItem[]>>({})

  /**
   * 채널 ID 또는 playlistId 기준으로 YouTube API 결과 가져오기
   * type은 'channel' 또는 'playlist'
   */
  async function fetchVideos(type: 'channel' | 'playlist', id: string) {
    const cacheKey = `${type}:${id}`
    if (videoCache.value[cacheKey])
      return // 이미 있음

    loading.value = true
    error.value = null

    try {
      const data = await $fetch(`/api/youtube?type=${type}&id=${id}`)

      const items: YoutubeVideoItem[] = data.items.map((item: any) => ({
        id: item.id.videoId || item.contentDetails?.videoId || '',
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url || '',
        publishedAt: item.snippet.publishedAt,
      }))

      videoCache.value[cacheKey] = items
    }
    catch (err: any) {
      error.value = err?.data?.error || err.message || 'YouTube API 요청 실패'
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    videoCache.value = {}
    error.value = null
  }

  return {
    loading,
    error,
    videoCache,
    fetchVideos,
    reset,
  }
})
