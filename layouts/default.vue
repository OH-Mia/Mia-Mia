<!-- layouts/default.vue -->
<script setup>
const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="container">
    <Header @open-sidebar="toggleSidebar" />

    <Transition name="sidebar">
      <Sidebar
        v-if="isSidebarOpen"
        @close-sidebar="toggleSidebar"
      />
    </Transition>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
::v-deep(.el-card) {
  border: none !important;
}

::v-deep(.el-card__body) {
  padding: 0 !important;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none !important;
}

.container {
  position: relative;
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.main {
  width: 100%;
  margin-top: 70px;
  transition: transform 0.3s ease;
  /* height: calc(100vh - 70px); */
  /* background: #764ba2; */
}

/* 사이드바 애니메이션 */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sidebar-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.sidebar-enter-to,
.sidebar-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .container {
    padding: 0;
  }
}

/* 사이드바가 열렸을 때 메인 컨텐츠 약간 이동 (선택사항) */
.main-shifted {
  transform: translateX(10px);
}
</style>
