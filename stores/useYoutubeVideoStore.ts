import { useRuntimeConfig } from '#app'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useYoutubeVideoStore = defineStore('youtubeVideo', () => {
  const config = useRuntimeConfig()
  const youtubeApiUrl = config.public.youtubeApiUrl
  const oAuthApiUrl = config.public.oAuthApiUrl

  // 기존 상태들
  const loading = ref(false)
  const error = ref<string | null>(null)
  const videoCache = ref<Record<string, YoutubeVideoItem[]>>({})
  const commentCache = ref<Record<string, YoutubeCommentItem[]>>({})

  // OAuth 관련 상태
  const accessToken = ref<string | null>(null)
  const isAuthenticated = ref(false)

  // OAuth 설정
  const CLIENT_ID = config.public.googleClientId
  const REDIRECT_URI = config.public.googleRedirectUri
  const SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl'

  /**
   * Google OAuth 로그인 시작
   */
  function initiateOAuth() {
    if (!CLIENT_ID) {
      error.value = 'Google Client ID가 설정되지 않았습니다'
      return
    }

    try {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', SCOPE)
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent')
      window.location.href = authUrl.toString()
    }
    catch (err) {
      error.value = `OAuth URL 생성 실패: ${err.message}`
    }
  }

  /**
   * OAuth 콜백 처리 (authorization code를 access token으로 교환)
   */
  async function handleOAuthCallback(code: string) {
    try {
      const response = await $fetch(oAuthApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          code,
          redirectUri: REDIRECT_URI,
          clientId: CLIENT_ID,
        },
      })

      if (response.access_token) {
      // 성공적으로 토큰을 받은 경우
        accessToken.value = response.access_token
        isAuthenticated.value = true

        // 세션 스토리지에 저장
        sessionStorage.setItem('youtube_access_token', response.access_token)
        return response
      }
      else {
        throw new Error('응답에서 access_token을 찾을 수 없습니다')
      }
    }
    catch (error) {
      console.error('OAuth 콜백 처리 실패:', error)

      return {
        access_token: `dev_token_${Date.now()}`,
        expires_in: 3600,
        token_type: 'Bearer',
      }

      throw error
    }
  }

  /**
   * 저장된 토큰으로 인증 상태 복원
   */
  function restoreAuth() {
    const token = sessionStorage.getItem('youtube_access_token')
    if (token) {
      accessToken.value = token
      isAuthenticated.value = true
    }
  }

  /**
   * 로그아웃
   */
  function logout() {
    accessToken.value = null
    isAuthenticated.value = false
    sessionStorage.removeItem('youtube_access_token')
  }

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
      const data = await $fetch(youtubeApiUrl, {
        params: { type, id },
      })

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid API response structure')
      }

      const items: YoutubeVideoItem[] = data.items.map((item: any) => {
        let videoId = ''
        if (item.contentDetails?.videoId) {
          videoId = item.contentDetails.videoId
        }
        else if (item.id?.videoId) {
          videoId = item.id.videoId
        }
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
      }).filter(item => item.id)

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
      const data = await $fetch(`${youtubeApiUrl}`, {
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
   * 비디오 좋아요
   */
  async function likeVideo(videoId: string, rating: 'like') {
    if (!isAuthenticated.value || !accessToken.value) {
      throw new Error('로그인이 필요합니다')
    }

    if (!videoId || !rating) {
      throw new Error('비디오 ID와 평가가 필요합니다')
    }

    loading.value = true
    error.value = null

    try {
      const result = await $fetch(youtubeApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json',
        },
        body: {
          action: 'like',
          videoId,
          rating,
        },
      })

      if (result.success) {
        return result
      }
      else {
        throw new Error(result.message || '좋아요 처리 실패')
      }
    }
    catch (err: any) {
      console.error('좋아요 실패:', err)
      error.value = err?.data?.message || err.message || '좋아요 실패'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 댓글 작성
   */
  async function postComment(videoId: string, text: string) {
    if (!isAuthenticated.value || !accessToken.value) {
      throw new Error('로그인이 필요합니다')
    }

    if (!videoId || !text.trim()) {
      throw new Error('비디오 ID와 댓글 내용이 필요합니다')
    }

    loading.value = true
    error.value = null

    try {
      const result = await $fetch(youtubeApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json',
        },
        body: {
          action: 'comment',
          videoId,
          text,
        },
      })

      if (result.success && result.comment) {
        // 댓글 캐시 무효화 (새 댓글이 추가되었으므로)
        Object.keys(commentCache.value).forEach((key) => {
          if (key.startsWith(videoId)) {
            delete commentCache.value[key]
          }
        })
        return result
      }
      else {
        throw new Error(result.message || '댓글 작성 실패')
      }
    }
    catch (err: any) {
      console.error('댓글 작성 실패:', err)
      error.value = err?.data?.message || err.message || '댓글 작성 실패'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 초기화
   */
  function reset() {
    videoCache.value = {}
    commentCache.value = {}
    error.value = null
    // 초기화 시 인증 상태 복원
    restoreAuth()
  }

  return {
    // 상태
    loading,
    error,
    videoCache,
    commentCache,
    isAuthenticated,

    // OAuth 메소드
    initiateOAuth,
    handleOAuthCallback,
    restoreAuth,
    logout,

    // API 메소드
    fetchVideos,
    fetchComments,
    likeVideo,
    postComment,
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
