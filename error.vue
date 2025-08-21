<!-- error.vue -->
<script setup lang="ts">
interface NuxtError {
  statusCode: number
  statusMessage?: string
  stack?: string
  data?: any
}

const props = defineProps<{
  error: NuxtError
}>()

const isDarkMode = computed(() => localStorage.getItem('dark-mode'))

// 에러 타입 확인
const is404 = computed(() => props.error.statusCode === 404)
const is500 = computed(() => props.error.statusCode === 500)

// 홈으로 돌아가기
function handleGoHome() {
  navigateTo('/')
}

// 이전 페이지로 돌아가기
function handleGoBack() {
  if (process.client && window.history.length > 1) {
    window.history.back()
  }
  else {
    navigateTo('/')
  }
}

// 에러 클리어 (페이지 새로고침 효과)
async function handleClearError() {
  await clearError({ redirect: '/' })
}
</script>

<template>
  <div class="error-page" :class="[isDarkMode ? 'dark' : '']">
    <!-- 404 에러 -->
    <div v-if="is404" class="error-content" :class="[isDarkMode ? 'dark' : '']">
      <div class="error-illustration">
        🌙
      </div>
      <h1 class="error-title" :class="[isDarkMode ? 'dark' : '']">
        페이지를 찾을 수 없습니다
      </h1>
      <p class="error-message">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <div class="error-actions">
        <button class="btn-primary" @click="handleGoHome">
          홈으로 돌아가기
        </button>
        <button class="btn-secondary" @click="handleGoBack">
          이전 페이지
        </button>
      </div>
    </div>

    <!-- 500 에러 -->
    <div v-else-if="is500" class="error-content">
      <div class="error-illustration">
        ⚡
      </div>
      <h1 class="error-title">
        서버 오류가 발생했습니다
      </h1>
      <p class="error-message">
        일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <div class="error-actions">
        <button class="btn-primary" @click="handleClearError">
          다시 시도
        </button>
        <button class="btn-secondary" @click="handleGoHome">
          홈으로 돌아가기
        </button>
      </div>
    </div>

    <!-- 기타 에러 -->
    <div v-else class="error-content">
      <div class="error-illustration">
        ❌
      </div>
      <h1 class="error-title">
        오류가 발생했습니다
      </h1>
      <p class="error-message">
        {{ error.statusMessage || `에러 코드: ${error.statusCode}` }}
      </p>
      <div class="error-actions">
        <button class="btn-primary" @click="handleClearError">
          다시 시도
        </button>
        <button class="btn-secondary" @click="handleGoHome">
          홈으로 돌아가기
        </button>
      </div>
    </div>

    <!-- 개발 모드에서 에러 스택 표시 -->
    <div v-if="$config.public.dev && error.stack" class="error-debug">
      <details>
        <summary>에러 상세 정보 (개발용)</summary>
        <pre>{{ error.stack }}</pre>
      </details>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 2rem;
  text-align: center;
}

.dark.error-page {
  background: #141414;
}

.error-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.dark.error-content {
  background: #252525;
}

.error-illustration {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
}

.dark.error-title {
  color: #fff;
}

.error-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
  transform: translateY(-2px);
}

.error-debug {
  margin-top: 2rem;
  text-align: left;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  border-radius: 10px;
  padding: 1rem;
  max-width: 600px;
  width: 100%;
}

.error-debug summary {
  cursor: pointer;
  margin-bottom: 1rem;
  color: #ffd700;
}

.error-debug pre {
  white-space: pre-wrap;
  font-size: 0.8rem;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .error-title {
    font-size: 1.3rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-content {
    padding: 1rem;
  }
}
</style>
