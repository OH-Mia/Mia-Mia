<!-- components/Header.vue -->
<script setup lang="ts">
const emit = defineEmits(['openSidebar'])

function onpenSidebar() {
  emit('openSidebar')
}
</script>

<template>
  <header class="header-container">
    <button class="icon-button" aria-label="사이드바 열기" @click="onpenSidebar">
      <img src="/icons/sidebar-open.png" alt="사이드바 열기">
    </button>

    <div class="header-title">
      <img src="/kkamgo.png" alt="로고" class="header-logo">
    </div>
    <div class="header-links">
      <button class="icon-button" aria-label="모드 전환">
        <!-- <div class="i-material-symbols:light-mode-rounded icon" /> -->
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
/* .header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  background: #f0e1ff;
} */

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
  background: #f0e1ff;
  /* background: #e1c2ff; */
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.header-title {
  display: flex;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  text-align: center;
  pointer-events: none;
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

/* 모바일일 때 버튼 그룹 숨김 */
@media (max-width: 768px) {
  .header-links {
    display: none;
  }
}
</style>
