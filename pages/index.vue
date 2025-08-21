<!-- pages/index.vue -->
<script setup>
definePageMeta({
  layout: 'default',
  type: 'route',
})

const youtubeStore = useYoutubeVideoStore()
const isProcessingOAuth = ref(false)
const oauthStatus = ref('')

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')

    if (authCode) {
      isProcessingOAuth.value = true
      oauthStatus.value = '인증 처리 중...'

      try {
        const success = await youtubeStore.handleOAuthCallback(authCode)
        if (success) {
          oauthStatus.value = '인증 완료! 이동 중...'

          // 잠시 대기 후 원래 페이지로 이동
          setTimeout(() => {
            const returnUrl = sessionStorage.getItem('oauth_return_url') || '/'
            window.location.href = returnUrl
          }, 1000)
        }
        else {
          oauthStatus.value = '인증에 실패했습니다.'
        }
      }
      catch (error) {
        console.error('OAuth 실패:', error)
        oauthStatus.value = '인증 중 오류가 발생했습니다.'
      }
    }
  }
})
</script>

<template>
  <!-- OAuth 콜백 처리 중일 때 -->
  <div v-if="isProcessingOAuth" class="oauth-processing">
    <div class="oauth-content">
      <div class="loading-spinner" />
      <h2 class="oauth-title">
        {{ oauthStatus }}
      </h2>
      <p class="oauth-description">
        {{ "잠시만 기다려주세요..." }}
      </p>
    </div>
  </div>

  <!-- 일반적인 랜딩 페이지 -->
  <div v-else class="landing-section">
    <div class="landing-image" />
    <div class="landing-content">
      <h1 class="landing-title">
        {{ "That is What the Moon Does." }}
      </h1>
    </div>
  </div>
</template>

<style scoped>
/* OAuth 처리 화면 스타일 */
.oauth-processing {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 9999;
}

.oauth-content {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid rgb(197, 197, 197);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.oauth-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;
}

.oauth-description {
  font-size: 1rem;
  opacity: 0.8;
  font-weight: 300;
  font-family: 'Playfair Display', serif;
}

.dark .oauth-processing {
  background: #201923;
}

.dark .oauth-content {
  color: white;
}

.dark .loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #ddd;
}

/* 기존 랜딩 페이지 스타일 */
.landing-section {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.landing-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/main-top.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.landing-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.0);
  z-index: 2;
}

.landing-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.landing-title {
  font-size: 4rem;
  font-weight: 400;
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: white;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.02em;
  line-height: 1.2;
  max-width: 90%;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .landing-title {
    font-size: 1.2rem;
  }

  .oauth-title {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .landing-title {
    font-size: 1.2rem;
  }

  .oauth-title {
    font-size: 1rem;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
  }
}
</style>
