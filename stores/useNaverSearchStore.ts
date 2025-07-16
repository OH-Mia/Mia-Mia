// stores/useNaverSearchStore.ts - 수정된 버전
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNaverSearchStore = defineStore('naverSearch', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const blogResults = ref<NaverSearchResponse | null>(null)
  const newsResults = ref<NaverSearchResponse | null>(null)

  async function searchBlog(key: string, query: string, start = 1, display = 100) {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch('/api/naver/blog/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { query, key, start, display },
      })

      blogResults.value = data
    }
    catch (err: any) {
      error.value = err.data?.error || err.message || '블로그 검색 실패'
      blogResults.value = null
    }
    finally {
      loading.value = false
    }
  }

  async function searchNews(query: string, start = 1, display = 15) {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch('/api/naver/news/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { query, start, display },
      })

      newsResults.value = data
    }
    catch (err: any) {
      error.value = err.data?.error || err.message || '뉴스 검색 실패'
      newsResults.value = null
    }
    finally {
      loading.value = false
    }
  }

  function resetResults() {
    blogResults.value = null
    newsResults.value = null
    error.value = null
  }

  return {
    loading,
    error,
    blogResults,
    newsResults,
    searchBlog,
    searchNews,
    resetResults,
  }
})

export interface NaverSearchItem {
  title: string
  link: string
  description: string
  bloggername?: string
  bloggerlink?: string
  postdate?: string
  pubDate?: string
}

export interface NaverSearchResponse {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: NaverSearchItem[]
}
