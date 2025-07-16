<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'
import { computed, ref } from 'vue'

definePageMeta({
  layout: 'default',
  type: 'route',
})

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
  // 비디오 페이지로 라우트 이동
  navigateTo(`/miatube/madaylog/${card.id}`)
}

// events
function handlePageChange(val: number) {
  currentPage.value = val
}

// 이미지 로드 에러 핸들러
function handleImageError(event: Event, card: YoutubeVideoItem) {
  const img = event.target as HTMLImageElement
  if (img.src !== card.thumbnailFallback) {
    // console.log(`고화질 썸네일 로드 실패, fallback으로 전환: ${card.id}`)
    img.src = card.thumbnailFallback
  }
}

// onMounted
onMounted(async () => {
  const mydayLogPlaylistId = config.public.mydayLogPlaylistId
  await youtubeStore.fetchVideos('playlist', mydayLogPlaylistId)

  const key = `playlist:${mydayLogPlaylistId}`
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
    // console.log('썸네일 최적화 완료:', cardList.value.length, '개 비디오')
  }
  else {
    cardList.value = []
  }
})
</script>

<template>
  <div class="page-container">
    <div class="card-grid">
      <el-card
        v-for="card in pagedCards"
        :key="card.id"
        class="card-item"
        shadow="hover"
        @click="handleCardClick(card)"
      >
        <div class="card-content">
          <el-image
            :src="card.thumbnail"
            :fallback="card.thumbnailFallback"
            fit="cover"
            class="thumbnail"
            lazy
            @error="handleImageError($event, card)"
          />
          <div class="info-overlay">
            <h3 class="title">
              {{ card.title }}
            </h3>
            <p class="date">
              {{ new Date(card.publishedAt).toLocaleDateString() }}
            </p>
          </div>
          <!-- 재생 아이콘 추가 -->
          <div class="i-material-symbols:play-arrow-rounded play-icon" />
        </div>
      </el-card>
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

.card-item {
  overflow: hidden;
  min-height: 200px;
  height: 350px;
  border-radius: 20px;
  cursor: pointer;
}

.card-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-item:hover .play-icon {
  width: 50px;
  height: 50px;
  opacity: 1;
}

.card-item:hover .thumbnail {
  opacity: 0.8;
}

::v-deep(.el-card) {
  border: none !important;
}

::v-deep(.el-card__body) {
  padding: 0 !important;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none !important;
}

.card-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 20px;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease;
}

.info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
  padding: 20px 16px 16px;
  color: white;
}

.title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
  color: white;
  /* text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  padding: 12px;
  backdrop-filter: blur(10px);
  pointer-events: none;
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
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .title {
    font-size: 0.85rem;
  }

  .date {
    font-size: 0.75rem;
  }

  .info-overlay {
    padding: 16px 12px 12px;
  }
}
</style>
