<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'
import { computed, ref } from 'vue'
import VideoCard from '~/components/VideoCard.vue' // 컴포넌트 import

definePageMeta({
  layout: 'default',
  type: 'route',
})

const route = useRoute()
const config = useRuntimeConfig()
const youtubeStore = useYoutubeVideoStore()

// ref
const cardList = ref<YoutubeVideoItem[]>([])
const currentPage = ref(1)
const pageSize = 10

// computed
const pagedCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return cardList.value.slice(start, start + pageSize)
})

// 고화질 썸네일 체크 함수
async function checkHighQualityThumbnail(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok && response.status !== 404
  }
  catch (error) {
    console.warn('썸네일 체크 실패:', error)
    return false
  }
}

// 최적 썸네일 URL 결정 함수
async function getBestThumbnailUrl(originalUrl: string): Promise<{ primary: string, fallback: string }> {
  const highResUrl = originalUrl.replace('mqdefault', 'maxresdefault')

  // 고화질 썸네일이 존재하는지 확인
  const isHighQualityAvailable = await checkHighQualityThumbnail(highResUrl)

  if (isHighQualityAvailable) {
    return {
      primary: highResUrl,
      fallback: originalUrl,
    }
  }
  else {
    return {
      primary: originalUrl,
      fallback: originalUrl,
    }
  }
}

// 카드 클릭 핸들러 - 라우트 이동
function handleCardClick(card: YoutubeVideoItem) {
  navigateTo(`${route.fullPath}/${card.id}`)
}

// events
function handlePageChange(val: number) {
  currentPage.value = val
}

// onMounted
onMounted(async () => {
  const myBagPlaylistId = config.public.myBagPlaylistId
  await youtubeStore.fetchVideos('playlist', myBagPlaylistId)

  const key = `playlist:${myBagPlaylistId}`
  const videos = youtubeStore.videoCache[key]

  if (Array.isArray(videos)) {
    // 병렬로 모든 비디오의 최적 썸네일 URL을 결정
    const thumbnailPromises = videos.map(async (video) => {
      const { primary, fallback } = await getBestThumbnailUrl(video.thumbnail)
      return {
        ...video,
        thumbnail: primary,
        thumbnailFallback: fallback,
      }
    })

    cardList.value = await Promise.all(thumbnailPromises)
  }
  else {
    cardList.value = []
  }
})
</script>

<template>
  <div class="page-container">
    <div class="card-grid">
      <VideoCard
        v-for="card in pagedCards"
        :key="card.id"
        :card="card"
        @click="handleCardClick"
      />
    </div>

    <div class="pagination-container">
      <el-pagination
        hide-on-single-page
        size="small"
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="cardList.length"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  min-height: calc(100dvh - 70px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  justify-content: center;
  margin-bottom: 2rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

::v-deep(.el-pagination .el-pager li),
::v-deep(.el-pagination .btn-prev),
::v-deep(.el-pagination .btn-next) {
  background-color: transparent;
  border: none;
}

/* ✅ 반응형 스타일 */
@media (max-width: 1280px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1.5rem 1rem;
    padding-top: 1rem;
  }

  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 0.75rem 1rem;
    padding-top: 0.5rem;
  }

  .card-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
