import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useYoutubeVideoStore = defineStore('youtubeVideo', () => {
  // 상태
  const loading = ref(false)
  const error = ref<string | null>(null)
  const videoCache = ref<Record<string, YoutubeVideoItem[]>>({})
  const commentCache = ref<Record<string, YoutubeCommentItem[]>>({}) // videoId → 댓글 리스트

  /**
   * 동영상 목록 조회
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

  /**
   * 댓글 목록 조회
   */
  async function fetchComments(videoId: string, pageToken = '') {
    const cacheKey = `${videoId}:${pageToken || 'first'}`

    // 캐시에 있으면 캐시된 데이터 반환
    // if (commentCache.value[cacheKey]) {
    //   console.log('캐시에서 댓글 반환:', commentCache.value, cacheKey)
    //   return {
    //     comments: commentCache.value[cacheKey],
    //     nextPageToken: null, // 캐시에서는 토큰 정보 없음
    //   }
    // }

    loading.value = true
    error.value = null

    try {
      console.log('API 댓글 요청:', { videoId, pageToken })

      const data = await $fetch('/api/youtube', { method: 'GET', params: { videoId, pageToken },
      })

      console.log('댓글 응답:', data)

      if (!data.items || !Array.isArray(data.items)) {
        console.error('잘못된 응답 구조:', data)
        throw new Error('댓글 데이터가 올바르지 않습니다')
      }

      // 캐시에 저장
      commentCache.value[cacheKey] = data.items.map((t: any) => ({
        id: t.id,
        author: t.snippet.topLevelComment.snippet.authorDisplayName,
        text: t.snippet.topLevelComment.snippet.textDisplay,
        publishedAt: t.snippet.topLevelComment.snippet.publishedAt,
      }))

      console.log('캐시 저장 완료:', commentCache.value[cacheKey])

      return {
        comments: commentCache.value[cacheKey],
        nextPageToken: data.nextPageToken || null,
      }
    }
    catch (e: any) {
      console.error('댓글 조회 에러:', e)
      error.value = e?.data?.error || e.message || '댓글 조회 실패'
      return { comments: [], nextPageToken: null }
    }
    finally {
      loading.value = false
    }
  }
  /**
   * 댓글 작성
   */
  async function addComment(
    targetId: string, // videoId 또는 parentId
    text: string,
    isReply = false, // false = 최상위, true = 답글
  ) {
    loading.value = true
    error.value = null
    try {
      const url = isReply
        ? '/api/youtube/comments'
        : '/api/youtube/commentThreads' // top-level
      const body = isReply
        ? { parentId: targetId, text } // reply
        : { videoId: targetId, text } // top-level

      await $fetch(url, { method: 'POST', body })
    }
    catch (e: any) {
      error.value = e?.data?.error || e.message || '댓글 작성 실패'
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 좋아요
   */
  async function rateVideo(videoId: string, rating: 'like' | 'dislike' | 'none' = 'like') {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/youtube/rate', {
        method: 'POST',
        body: { videoId, rating },
      })
    }
    catch (e: any) {
      error.value = e?.data?.error || e.message || '평가 실패'
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
    commentCache,
    fetchVideos,
    fetchComments,
    addComment,
    rateVideo,
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
  parentId?: string // reply 여부
}
