<!-- pages/index.vue -->
<script setup>
definePageMeta({
  layout: 'default',
  type: 'route',
})

const youtubeStore = useYoutubeVideoStore()

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')

    if (authCode) {
      console.log('루트에서 OAuth 콜백 처리:', authCode)

      try {
        const success = await youtubeStore.handleOAuthCallback(authCode)
        if (success) {
          console.log('OAuth 성공! 원래 페이지로 이동...')

          // 원래 페이지로 이동
          const returnUrl = sessionStorage.getItem('oauth_return_url') || '/'
          window.location.href = returnUrl
        }
      }
      catch (error) {
        console.error('OAuth 실패:', error)
      }
    }
  }
})
</script>

<template>
  <div class="landing-section">
    <div class="landing-image" />
    <div class="landing-content">
      <h1 class="landing-title">
        {{ "That is What the Moon Does." }}
      </h1>
    </div>
  </div>
</template>

<style scoped>
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
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .landing-title {
    font-size: 2rem;
  }
}
</style>
