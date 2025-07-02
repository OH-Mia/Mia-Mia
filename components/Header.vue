<script setup lang="ts">
</script>

<template>
  <header class="header-container">
    <button class="icon-button" aria-label="사이드바 열기">
      <img src="/icons/sidebar-open.png" alt="사이드바 열기">
    </button>

    <div class="header-title">
      🐰
    </div>

    <div class="header-links">
      <button class="icon-button" aria-label="네이버 블로그">
        <Icon name="mdi:post" class="icon" />
      </button>
      <button class="icon-button" aria-label="유튜브">
        <Icon name="mdi:youtube" class="icon" />
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
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  /* border: 1px solid black; */
  z-index: 100;
}

.header-title {
  font-size: 1.5rem;
  text-align: center;
  flex: 1;
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
</style>
