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

// Dicebear 아바타 URL 생성 함수
function generateDicebearAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?backgroundColor=b6e3f4,c0aede,d1d4f9&seed=Felix${encodeURIComponent(seed)}`
}

// 아바타 URL 생성 함수
function getAvatarUrl(comment: any) {
  // 프로필 이미지가 있으면 사용, 없으면 dicebear 아바타 생성
  return comment.authorProfileImageUrl || generateDicebearAvatar(comment.author)
}

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
          <div class="i-material-symbols:keyboard-double-arrow-left-rounded back-icon" />
          <span>{{ '마데로그 보쟈' }}</span>
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
      <!-- 댓글 섹션 -->
      <div class="comments-section">
        <div class="comments-header">
          <h2 class="comments-title">
            댓글
          </h2>
          <span class="comments-count">{{ comments.length }}개</span>
        </div>

        <!-- 댓글 로딩 상태 -->
        <div v-if="loadingComments && comments.length === 0" class="comments-loading">
          <el-skeleton animated>
            <template #template>
              <div v-for="i in 3" :key="i" class="comment-skeleton">
                <el-skeleton-item variant="circle" style="width: 40px; height: 40px;" />
                <div class="comment-content-skeleton">
                  <el-skeleton-item variant="text" style="width: 120px; height: 16px; margin-bottom: 8px;" />
                  <el-skeleton-item variant="text" style="width: 100%; height: 14px;" />
                  <el-skeleton-item variant="text" style="width: 80%; height: 14px;" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>

        <!-- 댓글 목록 -->
        <div v-else-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <el-avatar size="40" :src="getAvatarUrl(comment)" />
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-date">
                  {{ new Date(comment.publishedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) }}
                </span>
              </div>
              <div class="comment-text" v-html="comment.text" />
            </div>
          </div>

          <!-- 더보기 버튼 -->
          <div v-if="hasMoreComments" class="load-more-container">
            <el-button
              v-if="!loadingComments"
              type="primary"
              plain
              class="load-more-button"
              @click="loadMoreComments"
            >
              댓글 더보기
            </el-button>
            <div v-else class="loading-more">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              <span>댓글 불러오는 중...</span>
            </div>
          </div>
        </div>

        <!-- 댓글 없음 -->
        <div v-else class="no-comments">
          <el-empty description="댓글은 사랑입니다🫶" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-page {
  min-height: 100vh;
  overflow-x: hidden; /* 가로스크롤 방지 */
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
  font-size: 0.8rem;
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

/* 댓글 섹션 스타일 */
.comments-section {
  background: white;
  margin-top: 1rem;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.comments-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.comments-count {
  font-size: 0.9rem;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 12px;
}

.comments-loading {
  padding: 1rem 0;
}

.comment-skeleton {
  display: flex;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.comment-content-skeleton {
  flex: 1;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.comment-item:hover {
  background: #fafafa;
  margin: 0 -12px;
  padding: 12px;
  border-radius: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.comment-date {
  color: #666;
  font-size: 0.8rem;
}

.comment-text {
  color: #333;
  line-height: 1.5;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.comment-text a {
  color: #3b82f6;
  text-decoration: none;
}

.comment-text a:hover {
  text-decoration: underline;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1rem;
}

.load-more-button {
  min-width: 150px;
  height: 40px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.load-more-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.loading-more {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.loading-more .el-icon {
  font-size: 16px;
}

.no-comments {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.no-comments .el-empty {
  --el-empty-description-color: #999;
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

  .comments-section {
    padding: 1.5rem;
  }

  .comments-header {
    margin-bottom: 1.5rem;
  }

  .comments-title {
    font-size: 1.1rem;
  }

  .comment-item {
    gap: 10px;
  }

  .comment-avatar .el-avatar {
    width: 36px !important;
    height: 36px !important;
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

  .comments-section {
    padding: 1rem;
  }

  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .comment-item {
    gap: 8px;
  }

  .comment-avatar .el-avatar {
    width: 32px !important;
    height: 32px !important;
  }

  .comment-text {
    font-size: 0.85rem;
  }
}
</style>
