<!-- components/Header.vue -->
<script setup lang="ts">
const emit = defineEmits(['openSidebar'])
const route = useRoute()

// 투명 배경을 적용할 페이지들
const transparentPages = ['/'] // 원하는 페이지 경로들

// 현재 페이지가 투명 배경을 사용할지 확인
const isTransparentPage = computed(() => {
  return transparentPages.includes(route.path)
})

function onpenSidebar() {
  emit('openSidebar')
}

function goToMain() {
  navigateTo('/')
}
</script>

<template>
  <header class="header-container" :class="{ transparent: isTransparentPage }">
    <button class="icon-button" aria-label="사이드바 열기" @click="onpenSidebar">
      <img src="/icons/sidebar-open.png" alt="사이드바 열기">
    </button>

    <div class="header-title" @click="goToMain">
      <img src="/kkamgo.png" alt="로고" class="header-logo">
    </div>
    <div class="header-links">
      <button class="icon-button" aria-label="모드 전환">
        <div class="i-material-symbols:dark-mode-rounded icon" />
      </button>
      <button class="icon-button" aria-label="네이버 블로그">
        <div class="i-mdi-post icon" />
      </button>
      <button class="icon-button" aria-label="유튜브">
        <div class="i-mdi-youtube icon" />
      </button>
    </div>
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

@media (max-width: 768px) {
  .header-links {
    display: none;
  }
}
</style>
