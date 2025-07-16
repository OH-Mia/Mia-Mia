import type { NaverSearchItem } from './useNaverSearchStore'
// stores/useFirebaseSearchStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFirebaseSearchStore = defineStore('firebaseSearch', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cachedResults = ref<Record<string, NaverSearchItem[]>>({})

  /**
   * 특정 키(key)에 해당하는 Firestore에 저장된 블로그 검색 결과를 불러옴
   */
  async function fetchCachedResults(key: string) {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<{ query: string, results: NaverSearchItem[], createdAt: string }[]>(
        `/api/firebase/search/${encodeURIComponent(key)}`,
      )

      // 가장 최신 결과만 사용
      if (data.length > 0) {
        const latest = data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
        cachedResults.value[key] = latest.results
      }
      else {
        cachedResults.value[key] = []
      }
    }
    catch (err: any) {
      error.value = err.data?.error || err.message || '파이어베이스 검색 실패'
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    cachedResults.value = {}
    error.value = null
  }

  return {
    loading,
    error,
    cachedResults,
    fetchCachedResults,
    reset,
  }
})
