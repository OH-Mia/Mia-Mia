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

// 하트 애니메이션 관련 상태
const isLiked = ref(false)
const animatingHearts = ref([])

// OAuth 관련 상태
const showLoginModal = ref(false)
const commentText = ref('')
const submittingComment = ref(false)

const modalWidth = computed(() => {
  if (process.client) {
    const screenWidth = window.innerWidth
    if (screenWidth < 480)
      return '90%' // 모바일
    if (screenWidth < 768)
      return '80%' // 작은 태블릿
    if (screenWidth < 1024)
      return '450px' // 태블릿
    return '400px' // 데스크탑
  }
  return '400px'
})

// Dicebear 아바타 URL 생성 함수
function generateDicebearAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?backgroundColor=b6e3f4,c0aede,d1d4f9&shapeColor=f1f4dc&eyesColor=000000&seed=Felix${encodeURIComponent(seed)}`
}

// 아바타 URL 생성 함수
function getAvatarUrl(comment: any) {
  return comment.authorProfileImageUrl || generateDicebearAvatar(comment.author)
}

// 하트 클릭 핸들러 (ElMessage 제거)
async function handleHeartClick() {
  // 로그인되지 않은 경우 로그인 모달 표시
  if (!youtubeStore.isAuthenticated) {
    showLoginModal.value = true
    return
  }

  try {
    const newState = !isLiked.value

    // YouTube API 호출
    await youtubeStore.likeVideo(videoId, newState ? 'like' : 'none')

    // 성공시 상태 업데이트
    isLiked.value = newState

    if (newState) {
      createHeartAnimation()
    }
  }
  catch (err) {
    console.error('좋아요 실패:', err)
  }
}

// 간편 로그인 핸들러 (스토어 메소드 호출)
function handleEasyLogin() {
  showLoginModal.value = false

  try {
    // 현재 위치를 sessionStorage에 저장
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_return_url', window.location.pathname)
    }

    // 스토어의 OAuth 메소드 호출
    youtubeStore.initiateOAuth()
  }
  catch (error) {
    console.error('OAuth 시작 에러:', error)
  }
}

// 댓글 작성 핸들러 (ElMessage 제거)
// 댓글 작성 핸들러 (ElMessage 제거)
async function submitComment() {
  if (!youtubeStore.isAuthenticated) {
    return
  }

  if (!commentText.value.trim()) {
    return
  }

  try {
    submittingComment.value = true

    // YouTube API로 댓글 작성
    const newComment = await youtubeStore.postComment(videoId, commentText.value.trim())
    console.log('🚀 ~ newComment:', newComment)

    // 성공시 입력창 초기화
    commentText.value = ''

    // 새 댓글을 목록 맨 앞에 추가 (즉시 반영)
    if (newComment) {
      comments.value.unshift(newComment.comment)
      console.log('🚀 ~ comments.value:', comments.value)
    }
    else {
      // API 응답에 댓글 데이터가 없으면 전체 새로고침
      await refreshComments()
    }
  }
  catch (err) {
    console.error('댓글 작성 실패:', err)
    // 실패시에도 새로고침 시도
    await refreshComments()
  }
  finally {
    submittingComment.value = false
  }
}

// 댓글 목록 새로고침
async function refreshComments() {
  try {
    const result = await youtubeStore.fetchComments(videoId, '')
    comments.value = result.comments
    nextPageToken.value = result.nextPageToken || ''
    hasMoreComments.value = !!result.nextPageToken
  }
  catch (err) {
    console.error('댓글 새로고침 실패:', err)
  }
}

// 하트 애니메이션 생성
function createHeartAnimation() {
  const heartId = Date.now()

  // 랜덤 시작 위치 (하트 버튼 주변)
  const startX = Math.random() * 40 - 20 // -20px ~ 20px
  const startY = 0

  // 애니메이션 하트 추가
  animatingHearts.value.push({
    id: heartId,
    x: startX,
    y: startY,
    opacity: 1,
    scale: 1,
    rotation: Math.random() * 360,
  })

  // 애니메이션 실행
  setTimeout(() => {
    const heart = animatingHearts.value.find(h => h.id === heartId)
    if (heart) {
      heart.y = -100 // 위로 이동
      heart.opacity = 0
      heart.scale = 0.5
      heart.rotation += 180
    }
  }, 50)

  // 애니메이션 완료 후 제거
  setTimeout(() => {
    animatingHearts.value = animatingHearts.value.filter(h => h.id !== heartId)
  }, 1500)
}

// 비디오 데이터 가져오기
async function fetchVideoData() {
  try {
    loading.value = true
    error.value = ''

    const vlogPlaylistId = config.public.vlogPlaylistId
    await youtubeStore.fetchVideos('playlist', vlogPlaylistId)

    const key = `playlist:${vlogPlaylistId}`
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
async function loadMoreComments() {
  if (!hasMoreComments.value || loadingComments.value)
    return

  try {
    loadingComments.value = true

    const result = await youtubeStore.fetchComments(videoData.value.id, nextPageToken.value)

    // 기존 댓글에 새 댓글 추가
    comments.value = [...comments.value, ...result.comments]
    nextPageToken.value = result.nextPageToken || ''
    hasMoreComments.value = !!result.nextPageToken
  }
  catch (err) {
    console.error('추가 댓글 로드 실패:', err)
  }
  finally {
    loadingComments.value = false
  }
}

// 뒤로가기
function goBack() {
  navigateTo('/miatube/vlog')
}

// 유튜브 임베드 URL 생성
const embedUrl = computed(() => {
  if (!videoData.value)
    return ''
  return `https://www.youtube.com/embed/${videoData.value.id}?autoplay=1&rel=0&modestbranding=1&showinfo=0`
})

// OAuth 콜백 처리 (루트에서 처리)
onMounted(async () => {
  if (process.client) {
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')
    const state = urlParams.get('state')

    if (authCode) {
      console.log('OAuth 콜백 처리 중...', authCode)

      const success = await youtubeStore.handleOAuthCallback(authCode)
      if (success) {
        console.log('로그인 성공!')

        // URL 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname)

        // 원래 위치로 이동 (state 또는 sessionStorage 사용)
        const returnUrl = state ? decodeURIComponent(state) : sessionStorage.getItem('oauth_return_url')
        if (returnUrl && returnUrl !== window.location.pathname) {
          await navigateTo(returnUrl)
          return
        }
      }
    }
  }

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
        <el-button type="text" class="back-button" @click="goBack">
          <div class="i-material-symbols:keyboard-double-arrow-left-rounded back-icon" />
          <span>{{ '브이로그 보쟈' }}</span>
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
          <div class="comments-info">
            <h2 class="comments-title">
              댓글
            </h2>
            <span class="comments-count">{{ comments.length }}개</span>
          </div>

          <!-- 하트 버튼 -->
          <div class="heart-button-container">
            <button
              class="heart-button"
              :class="{ liked: isLiked }"
              @click="handleHeartClick"
            >
              <div class="i-mdi-heart heart-icon" />
            </button>

            <!-- 애니메이션 하트들 -->
            <div
              v-for="heart in animatingHearts"
              :key="heart.id"
              class="floating-heart"
              :style="{
                transform: `translate(${heart.x}px, ${heart.y}px) scale(${heart.scale}) rotate(${heart.rotation}deg)`,
                opacity: heart.opacity,
              }"
            >
              <div class="i-mdi-heart" />
            </div>
          </div>
        </div>

        <!-- 댓글 작성 폼 -->
        <div v-if="youtubeStore.isAuthenticated" class="comment-form">
          <div class="comment-input-container">
            <el-input
              v-model="commentText"
              type="textarea"
              placeholder="댓글을 입력하세요..."
              :rows="3"
              maxlength="500"
              show-word-limit
              resize="none"
            />
            <div class="comment-form-actions">
              <el-button
                size="small" :disabled="!commentText.trim()" @click="commentText = ''"
              >
                {{ "취소" }}
              </el-button>
              <el-button
                :loading="submittingComment"
                type="info" size="small" :disabled="!commentText.trim()" @click="submitComment"
              >
                {{ "댓글 작성" }}
              </el-button>
            </div>
          </div>
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
              <div class="loading-spinner">
                ⏳
              </div>
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

    <!-- 로그인 모달 -->
    <el-dialog
      v-model="showLoginModal"
      title=""
      :width="modalWidth"
      :show-close="false"
      align-center
    >
      <div class="login-modal-content">
        <div class="login-icon">
          <div class="i-mdi-heart login-heart" />
        </div>
        <h3 class="login-title">
          {{ "좋아요를 누르시겠어요?" }}
        </h3>
        <p class="login-description">
          구글 계정으로 간단하게 로그인하면<br>
          영상에 좋아요를 남길 수 있어요! 💖
        </p>
        <div class="login-actions">
          <el-button size="large" @click="showLoginModal = false">
            {{ "다음에 할게요" }}
          </el-button>
          <el-button
            :loading="youtubeStore.loading"
            type="primary" size="large" @click="handleEasyLogin"
          >
            <img src="/icons/google-icon.svg" alt="Google" class="login-google-icon">
            {{ "구글로 로그인" }}
          </el-button>
        </div>
        <p class="login-note">
          {{ "* 로그인 정보는 좋아요/댓글 작성 기능에만 사용돼요" }}
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 모든 기존 스타일 유지 */
.video-page {
  min-height: 100vh;
  overflow-x: hidden;
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
  margin-bottom: 1rem;
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
  padding-bottom: 56.25%;
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
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.comments-info {
  display: flex;
  align-items: center;
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
  margin: 0 8px;
  border-radius: 12px;
}

/* 댓글 작성 폼 스타일 */
.comment-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.comment-input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
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

/* 하트 버튼 스타일 */
.heart-button-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.heart-button:hover {
  background: #fee2e2;
  transform: scale(1.1);
}

.heart-button.liked {
  background: #fecaca;
  animation: heartPulse 0.6s ease-in-out;
}

.heart-icon {
  font-size: 24px;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.heart-button:hover .heart-icon {
  color: #f87171;
}

.heart-button.liked .heart-icon {
  color: #ef4444;
  transform: scale(1.2);
}

/* 떠오르는 하트 애니메이션 */
.floating-heart {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
  z-index: 1;
  transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.floating-heart .i-mdi-heart {
  font-size: 20px;
  color: #ef4444;
  filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.5));
}

/* 하트 펄스 애니메이션 */
@keyframes heartPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
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

.loading-spinner {
  animation: spin 1s linear infinite;
  font-size: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.no-comments {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.no-comments .el-empty {
  --el-empty-description-color: #999;
}

/* 친화적인 로그인 모달 스타일 */
.login-modal-content {
  text-align: center;
  padding: 1rem 0;
}

.login-icon {
  margin-bottom: 1rem;
}

.login-heart {
  font-size: 3rem;
  color: #ef4444;
  animation: loginHeartBeat 1.5s ease-in-out infinite;
}

.login-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.dark .login-title {
  color: #fff;
}

.login-description {
  color: #666;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  font-size: 0.95rem;
}

.login-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.login-actions .el-button {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  font-weight: 500;
  margin: 0;
}

.login-google-icon {
  margin-right: 8px;
  width: 18px;
}

.login-note {
  font-size: 0.8rem;
  color: #999;
  margin: 0;
}

@keyframes loginHeartBeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
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
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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

  .comment-form {
    padding: 1rem;
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
    display: flex;
    flex-direction: row;
    align-items:center;
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

  .comment-form {
    padding: 0.75rem;
  }
}
</style>
