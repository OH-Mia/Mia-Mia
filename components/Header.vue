<!-- components/Header.vue -->
<script setup lang="ts">
const emit = defineEmits(['openSidebar'])
const route = useRoute()

// ref
const isDark = ref(false)

// 투명 배경을 적용할 페이지들
const transparentPages = ['/'] // 원하는 페이지 경로들

// 현재 페이지가 투명 배경을 사용할지 확인
const isTransparentPage = computed(() => {
  return transparentPages.includes(route.path)
})

// events
function toggleDarkMode() {
  isDark.value = !isDark.value
  localStorage.setItem('dark-mode', String(isDark.value))
  document.documentElement.classList.toggle('dark', isDark.value)
}

function onpenSidebar() {
  emit('openSidebar')
}

function goToMain() {
  navigateTo('/')
}

function goToNaverBlog() {
  window.open('https://blog.naver.com/mia4956', '_blank')
}

function goToYoutube() {
  window.open('https://www.youtube.com/@miatube3164', '_blank')
}

// onMounted
onMounted(() => {
  const saved = localStorage.getItem('dark-mode') === 'true'
  isDark.value = saved
  document.documentElement.classList.toggle('dark', saved)
})
</script>

<template>
  <header class="header-container" :class="{ transparent: isTransparentPage }">
    <button class="icon-button sidebar-button desktop-sidebar" aria-label="사이드바 열기" @click="onpenSidebar">
      <div class="i-mdi-menu-open icon" />
    </button>
    <div class="header-links mobile-links" />

    <div class="header-title" @click="goToMain">
      <img src="/kkamgo.png" alt="로고" class="header-logo">
    </div>

    <div class="header-links desktop-links">
      <button class="icon-button" aria-label="모드 전환" @click="toggleDarkMode">
        <div class="icon" :class="[isDark ? 'i-material-symbols:light-mode-rounded icon' : 'i-material-symbols:dark-mode-rounded icon']" />
      </button>
      <button class="icon-button" aria-label="네이버 블로그" @click="goToNaverBlog">
        <div class="i-mdi-post icon" />
      </button>
      <button class="icon-button" aria-label="유튜브" @click="goToYoutube">
        <div class="i-mdi-youtube icon" />
      </button>
    </div>

    <button class="icon-button sidebar-button mobile-sidebar" aria-label="사이드바 열기" @click="onpenSidebar">
      <div class="i-mdi-menu-open icon" />
    </button>
  </header>
</template>

<style scoped>
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 16px;
  background: rgba(240, 225, 255, 0.5);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 투명 배경 클래스 */
.header-container.transparent {
  background: transparent;
  /* 또는 반투명: background: rgba(240, 225, 255, 0.5); */
}

.header-title {
  display: flex;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  text-align: center;
  cursor: pointer;
}

.header-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.icon-button img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
}

.header-links {
  display: flex;
  gap: 12px;
}

/* 데스크톱에서는 기본 레이아웃 */
.mobile-sidebar {
  display: none;
}

.mobile-links {
  display: none;
}

.desktop-sidebar {
  display: flex;
}

.desktop-links {
  display: flex;
}

/* 모바일에서는 레이아웃 변경 */
@media (max-width: 768px) {
  .desktop-sidebar {
    display: none;
  }

  .desktop-links {
    display: none;
  }

  .mobile-sidebar {
    display: flex;
  }

  .mobile-links {
    display: flex;
  }
}
</style>
