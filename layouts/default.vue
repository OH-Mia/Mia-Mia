<!-- layouts/default.vue -->
<script setup>
const isSidebarOpen = ref(false)
const isHeaderVisible = ref(true)
const lastScrollTop = ref(0)
const scrollDirection = ref('down')

// 현재 라우트 정보 가져오기
const route = useRoute()

// 패딩 탑이 필요없는 페이지들 정의
const noTopPaddingPages = ['/'] // 원하는 페이지 경로들 추가

// 현재 페이지가 패딩 탑이 필요없는 페이지인지 확인
const shouldHaveTopPadding = computed(() => {
  return !noTopPaddingPages.includes(route.path)
})

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 모바일에서 스크롤 감지
function handleScroll() {
  if (window.innerWidth > 768)
    return // 모바일에서만 동작

  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollDelta = currentScrollTop - lastScrollTop.value

  // 스크롤 임계값 설정
  const scrollThreshold = 10
  const headerHeight = 70

  // 스크롤 방향 감지
  if (Math.abs(scrollDelta) > scrollThreshold) {
    if (scrollDelta > 0 && currentScrollTop > headerHeight) {
      // 아래로 스크롤 - 헤더 높이보다 많이 스크롤했을 때만 숨김
      scrollDirection.value = 'down'
      isHeaderVisible.value = false
    }
    else if (scrollDelta < 0) {
      // 위로 스크롤 - 바로 헤더 보임
      scrollDirection.value = 'up'
      isHeaderVisible.value = true
    }
  }

  // 최상단에 있을 때는 항상 헤더 보임
  if (currentScrollTop <= headerHeight) {
    isHeaderVisible.value = true
  }

  lastScrollTop.value = currentScrollTop
}

// 스크롤 이벤트 리스너 등록
onMounted(() => {
  if (process.client) {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="container">
    <Header
      :class="{ 'header-hidden': !isHeaderVisible }"
      @open-sidebar="toggleSidebar"
    />

    <Transition name="sidebar">
      <Sidebar
        v-if="isSidebarOpen"
        @close-sidebar="toggleSidebar"
      />
    </Transition>

    <main
      class="main"
      :class="{
        'main-expanded': !isHeaderVisible,
        'main-no-padding': !shouldHaveTopPadding,
      }"
    >
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
  background: #fcf9ff;
}

.main {
  width: 100%;
  margin-top: 70px;
}

/* 패딩 탑이 없는 페이지 */
.main-no-padding {
  margin-top: 0;
}

/* 메인 컨텐츠 확장 */
.main-expanded {
  margin-top: 70px;
}

/* 패딩 탑이 없는 페이지에서는 확장 시에도 margin-top 0 유지 */
.main-no-padding.main-expanded {
  margin-top: 0;
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

  .main {
    margin-top: 70px;
  }

  .main-no-padding {
    margin-top: 0;
  }

  .main-expanded {
    margin-top: 70px;
  }

  .main-no-padding.main-expanded {
    margin-top: 0;
  }

  /* 모바일에서 헤더 애니메이션 향상 */
  ::v-deep(.header) {
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  ::v-deep(.header-hidden) {
    transform: translateY(-100%);
  }
}

/* 사이드바가 열렸을 때 메인 컨텐츠 약간 이동 (선택사항) */
.main-shifted {
  transform: translateX(10px);
}
</style>
