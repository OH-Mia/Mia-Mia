import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useYoutubeVideoStore = defineStore('youtubeVideo', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const videoCache = ref<Record<string, YoutubeVideoItem[]>>({})
  const commentCache = ref<Record<string, YoutubeCommentItem[]>>({})

  /**
   * 동영상 목록 조회
   */
  async function fetchVideos(type: 'channel' | 'playlist', id: string): Promise<YoutubeVideoItem[]> {
    const cacheKey = `${type}:${id}`

    if (videoCache.value[cacheKey]) {
      return videoCache.value[cacheKey]
    }

    loading.value = true
    error.value = null

    try {
      // 로컬 API 사용
      const data = await $fetch('/api/youtube', {
        params: { type, id },
      })

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid API response structure')
      }

      const items: YoutubeVideoItem[] = data.items.map((item: any) => {
        let videoId = ''

        // 플레이리스트 아이템인 경우
        if (item.contentDetails?.videoId) {
          videoId = item.contentDetails.videoId
        }
        // 검색 결과인 경우
        else if (item.id?.videoId) {
          videoId = item.id.videoId
        }
        // 직접 문자열인 경우
        else if (typeof item.id === 'string') {
          videoId = item.id
        }

        return {
          id: videoId,
          title: item.snippet?.title || 'No Title',
          description: item.snippet?.description || '',
          thumbnail: item.snippet?.thumbnails?.medium?.url
            || item.snippet?.thumbnails?.default?.url || '',
          publishedAt: item.snippet?.publishedAt || '',
        }
      }).filter(item => item.id) // ID가 없는 항목 제거

      videoCache.value[cacheKey] = items
      return items
    }
    catch (err: any) {
      console.error('fetchVideos error:', err)
      error.value = err?.data?.statusMessage || err.message || 'YouTube API 요청 실패'
      return []
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 댓글 목록 조회
   */
  async function fetchComments(videoId: string, pageToken = '') {
    const cacheKey = `${videoId}:${pageToken || 'first'}`

    loading.value = true
    error.value = null

    try {
      // 로컬 API 사용 - videoId 파라미터 전달
      const data = await $fetch('/api/youtube', {
        params: {
          videoId,
          ...(pageToken && { pageToken }),
        },
      })

      if (!data.items || !Array.isArray(data.items)) {
        console.error('잘못된 댓글 응답 구조:', data)
        throw new Error('댓글 데이터가 올바르지 않습니다')
      }

      const comments = data.items.map((item: any) => ({
        id: item.id,
        author: item.snippet?.topLevelComment?.snippet?.authorDisplayName || 'Unknown',
        text: item.snippet?.topLevelComment?.snippet?.textDisplay || '',
        publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt || '',
      }))

      // 캐시에 저장
      commentCache.value[cacheKey] = comments

      return {
        comments,
        nextPageToken: data.nextPageToken || null,
      }
    }
    catch (e: any) {
      console.error('댓글 조회 에러:', e)
      error.value = e?.data?.statusMessage || e.message || '댓글 조회 실패'
      return { comments: [], nextPageToken: null }
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 댓글 작성 (YouTube API 키로는 읽기 전용이므로 실제로는 작동하지 않을 수 있음)
   */
  async function addComment(targetId: string, text: string, isReply = false) {
    loading.value = true
    error.value = null

    try {
      // 댓글 작성은 OAuth가 필요하므로 현재 구현에서는 제한적
      console.warn('댓글 작성은 OAuth 인증이 필요합니다')
      error.value = '댓글 작성은 현재 지원되지 않습니다 (OAuth 필요)'
    }
    catch (e: any) {
      error.value = e?.message || '댓글 작성 실패'
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 좋아요 (마찬가지로 OAuth 필요)
   */
  async function rateVideo(videoId: string, rating: 'like' | 'dislike' | 'none' = 'like') {
    loading.value = true
    error.value = null

    try {
      console.warn('동영상 평가는 OAuth 인증이 필요합니다')
      error.value = '동영상 평가는 현재 지원되지 않습니다 (OAuth 필요)'
    }
    catch (e: any) {
      error.value = e?.message || '평가 실패'
    }
    finally {
      loading.value = false
    }
  }

  function getVideos(type: 'channel' | 'playlist', id: string): YoutubeVideoItem[] {
    const cacheKey = `${type}:${id}`
    return videoCache.value[cacheKey] || []
  }

  function reset() {
    videoCache.value = {}
    commentCache.value = {}
    error.value = null
  }

  return {
    loading,
    error,
    videoCache,
    commentCache,
    fetchVideos,
    fetchComments,
    addComment,
    rateVideo,
    getVideos,
    reset,
  }
})

export interface YoutubeVideoItem {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  viewCount?: string
}

export interface YoutubeCommentItem {
  id: string
  author: string
  text: string
  publishedAt: string
  parentId?: string
}
