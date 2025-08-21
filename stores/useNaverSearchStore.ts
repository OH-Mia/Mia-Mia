import { useRuntimeConfig } from '#app'
// stores/useNaverSearchStore.ts - 수정된 버전
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNaverSearchStore = defineStore('naverSearch', () => {
  const config = useRuntimeConfig()
  const blogApiUrl = config.public.blogApiUrl

  const loading = ref(false)
  const error = ref<string | null>(null)
  const errorCode = ref<string | null>(null)

  const blogResults = ref<NaverSearchResponse | null>(null)
  const searchHistory = ref<SearchHistoryItem[]>([])

  // 네이버 블로그 검색
  async function searchBlog(query: string, start = 1, display = 100) {
    if (!query.trim()) {
      error.value = '검색어를 입력해주세요.'
      errorCode.value = 'MISSING_QUERY'
      return
    }

    loading.value = true
    error.value = null
    errorCode.value = null

    try {
      const data = await $fetch(blogApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          query: query.trim(),
          start: Math.max(1, start),
          display: Math.min(100, Math.max(1, display)),
        },
      })

      blogResults.value = data

      // 검색 기록 추가
      addToHistory({
        query: query.trim(),
        resultCount: data.items?.length || 0,
        totalCount: data.total || 0,
        timestamp: new Date().toISOString(),
      })

      // 결과가 없는 경우 알림
      if (!data.items || data.items.length === 0) {
        error.value = '블로그에서 검색 결과를 찾을 수 없습니다.'
        errorCode.value = 'NO_RESULTS'
      }
    }
    catch (err: any) {
      console.error('블로그 검색 오류:', err)

      // 에러 코드별 처리
      if (err.data?.code) {
        errorCode.value = err.data.code
        switch (err.data.code) {
          case 'MISSING_QUERY':
            error.value = '검색어가 필요합니다.'
            break
          case 'NAVER_API_ERROR':
            error.value = `네이버 API 오류: ${err.data.details || '알 수 없는 오류'}`
            break
          case 'MISSING_ENV_VARS':
            error.value = '서버 설정 오류입니다. 관리자에게 문의하세요.'
            break
          case 'METHOD_NOT_ALLOWED':
            error.value = '잘못된 요청 방식입니다.'
            break
          case 'INTERNAL_ERROR':
            error.value = '서버 내부 오류가 발생했습니다.'
            break
          default:
            error.value = err.data.error || '알 수 없는 오류가 발생했습니다.'
        }
      }
      else {
        error.value = err.message || '블로그 검색 중 오류가 발생했습니다.'
        errorCode.value = 'UNKNOWN_ERROR'
      }

      blogResults.value = null
    }
    finally {
      loading.value = false
    }
  }

  // 더 많은 결과 로드 (페이징)
  async function loadMore(query: string) {
    if (!blogResults.value || loading.value)
      return

    const nextStart = blogResults.value.start + blogResults.value.display
    const currentItems = blogResults.value.items || []

    await searchBlog(query, nextStart, 15)

    // 기존 결과와 새 결과 합치기
    if (blogResults.value && blogResults.value.items) {
      blogResults.value.items = [...currentItems, ...blogResults.value.items]
      blogResults.value.start = 1 // 시작점을 1로 리셋
      blogResults.value.display = blogResults.value.items.length // 실제 표시 개수로 업데이트
    }
  }

  // 검색 기록에 추가
  function addToHistory(historyItem: SearchHistoryItem) {
    // 중복 제거 (같은 쿼리 조합)
    searchHistory.value = searchHistory.value.filter(
      item => item.query !== historyItem.query,
    )

    // 최신 검색을 맨 앞에 추가
    searchHistory.value.unshift(historyItem)

    // 최대 20개까지만 보관
    if (searchHistory.value.length > 20) {
      searchHistory.value = searchHistory.value.slice(0, 20)
    }
  }

  // 검색 기록 삭제
  function removeFromHistory(index: number) {
    searchHistory.value.splice(index, 1)
  }

  // 검색 기록 전체 삭제
  function clearHistory() {
    searchHistory.value = []
  }

  // 결과 및 에러 초기화
  function resetResults() {
    blogResults.value = null
    error.value = null
    errorCode.value = null
  }

  // 전체 상태 초기화
  function resetAll() {
    resetResults()
    loading.value = false
    searchHistory.value = []
  }

  // 검색 결과가 있는지 확인
  const hasResults = computed(() => {
    return blogResults.value && blogResults.value.items && blogResults.value.items.length > 0
  })

  // 더 불러올 결과가 있는지 확인
  const hasMore = computed(() => {
    if (!blogResults.value)
      return false
    const currentCount = blogResults.value.items?.length || 0
    return currentCount < blogResults.value.total
  })

  return {
    // State
    loading,
    error,
    errorCode,
    blogResults,
    searchHistory,

    // Computed
    hasResults,
    hasMore,

    // Actions
    searchBlog,
    loadMore,
    addToHistory,
    removeFromHistory,
    clearHistory,
    resetResults,
    resetAll,
  }
})

// 인터페이스 정의
export interface NaverSearchItem {
  title: string
  link: string
  description: string
  bloggername?: string
  bloggerlink?: string
  postdate?: string // YYYY-MM-DD 형식
  pubDate?: string
}

export interface NaverSearchResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NaverSearchItem[]
}

export interface SearchHistoryItem {
  query: string
  resultCount: number
  totalCount: number
  timestamp: string // ISO string
}
