<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'
import { onMounted, ref } from 'vue'

definePageMeta({
  layout: 'default',
  type: 'route',
})

const config = useRuntimeConfig()
const youtubeStore = useYoutubeVideoStore()
const route = useRoute()

// refs
const videoData = ref<YoutubeVideoItem | null>(null)
const loading = ref(true)
const error = ref('')

// 비디오 ID
const videoId = route.params.id as string

// 댓글 관련 상태 추가
const comments = ref([]) // 모든 댓글 목록
const nextPageToken = ref('') // 다음 페이지 토큰
const hasMoreComments = ref(false) // 더 많은 댓글 여부
const loadingComments = ref(false) // 댓글 로딩 상태

// 비디오 데이터 가져오기
async function fetchVideoData() {
  try {
    loading.value = true
    error.value = ''

    const mydayLogPlaylistId = config.public.mydayLogPlaylistId
    await youtubeStore.fetchVideos('playlist', mydayLogPlaylistId)

    const key = `playlist:${mydayLogPlaylistId}`
    const videos = youtubeStore.videoCache[key]

    if (Array.isArray(videos)) {
      const video = videos.find(v => v.id === videoId)
      if (video) {
        videoData.value = video

        // 댓글 초기화 후 첫 번째 페이지 로드
        comments.value = []
        nextPageToken.value = ''
        await loadInitialComments(video.id)
      }
      else {
        error.value = '비디오를 찾을 수 없습니다.'
      }
    }
    else {
      error.value = '플레이리스트를 불러올 수 없습니다.'
    }
  }
  catch (err) {
    error.value = '비디오를 불러오는 중 오류가 발생했습니다.'
    console.error('비디오 데이터 로드 실패:', err)
  }
  finally {
    loading.value = false
  }
}

// 첫 번째 댓글 페이지 로드
async function loadInitialComments(videoId) {
  try {
    const result = await youtubeStore.fetchComments(videoId, '')
    comments.value = result.comments
    // console.log('🚀🚀🚀 ~ loadInitialComments ~ comments.value:', comments.value)
    nextPageToken.value = result.nextPageToken || ''
    hasMoreComments.value = !!result.nextPageToken
  }
  catch (err) {
    console.error('초기 댓글 로드 실패:', err)
  }
}

// 추가 댓글 페이지 로드
// async function loadMoreComments() {
//   if (!hasMoreComments.value || loadingComments.value)
//     return

//   try {
//     loadingComments.value = true

//     const result = await youtubeStore.fetchComments(videoData.value.id, nextPageToken.value)

//     // 기존 댓글에 새 댓글 추가
//     comments.value = [...comments.value, ...result.comments]
//     nextPageToken.value = result.nextPageToken || ''
//     hasMoreComments.value = !!result.nextPageToken
//   }
//   catch (err) {
//     console.error('추가 댓글 로드 실패:', err)
//   }
//   finally {
//     loadingComments.value = false
//   }
// }

// 뒤로가기
function goBack() {
  navigateTo('/miatube/madaylog')
}

// 유튜브 임베드 URL 생성
const embedUrl = computed(() => {
  if (!videoData.value)
    return ''
  return `https://www.youtube.com/embed/${videoData.value.id}?autoplay=1&rel=0&modestbranding=1&showinfo=0`
})

onMounted(() => {
  fetchVideoData()
})
</script>

<template>
  <div class="video-page">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated>
        <template #template>
          <div class="video-skeleton">
            <el-skeleton-item variant="rect" style="width: 100%; height: 60vh; border-radius: 12px;" />
            <div class="video-info-skeleton">
              <el-skeleton-item variant="text" style="width: 80%; height: 32px; margin-bottom: 16px;" />
              <el-skeleton-item variant="text" style="width: 200px; height: 16px;" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <el-result icon="error" :title="error" sub-title="다시 시도해주세요.">
        <template #extra>
          <el-button type="primary" @click="goBack">
            목록으로 돌아가기
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- 비디오 재생 -->
    <div v-else-if="videoData" class="video-container">
      <!-- 상단 네비게이션 -->
      <div class="video-nav">
        <el-button
          type="text"
          class="back-button"
          @click="goBack"
        >
          <el-icon class="back-icon">
            <ArrowLeft />
          </el-icon>
          목록으로
        </el-button>
      </div>

      <!-- 비디오 플레이어 -->
      <div class="video-player">
        <iframe
          :src="embedUrl"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          class="youtube-iframe"
        />
      </div>

      <!-- 비디오 정보 -->
      <div class="video-info">
        <h1 class="video-title">
          {{ videoData.title }}
        </h1>
        <div class="video-meta">
          <span class="publish-date">
            {{ new Date(videoData.publishedAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) }}
          </span>
        </div>
        <div v-if="videoData.description" class="video-description">
          <p>{{ videoData.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.loading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.video-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.video-info-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.video-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.video-nav {
  margin-bottom: 2rem;
}

.back-button {
  font-size: 16px;
  color: #666;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #e9ecef;
  color: #333;
}

.back-icon {
  margin-right: 8px;
}

.video-player {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 비율 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.youtube-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

.video-info {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.video-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 1.5rem;
  color: #666;
}

.publish-date {
  font-size: 0.9rem;
}

.video-description {
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
}

.video-description p {
  margin: 0;
  white-space: pre-wrap;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .video-container {
    padding: 1rem;
  }

  .video-info {
    padding: 1.5rem;
  }

  .video-title {
    font-size: 1.25rem;
  }

  .back-button {
    font-size: 14px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .video-container {
    padding: 0.5rem;
  }

  .video-info {
    padding: 1rem;
  }

  .video-title {
    font-size: 1.1rem;
  }
}
</style>
