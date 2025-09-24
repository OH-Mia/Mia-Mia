<!-- components/Sidebar.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['closeSidebar'])
const router = useRouter()

// refs
const activeNames = ref(['youtube', 'post'])
const currentMenu = ref('') // 클릭된 서브 메뉴 상태

// dark mode composable
const { isDark, toggleDarkMode, initializeDarkMode } = useDarkMode()

// events

function onCloseSidebar() {
  emit('closeSidebar')
}

function selectMenu(name: string) {
  currentMenu.value = name

  // 메뉴에 따라 라우팅
  const routeMap: Record<string, string> = {
    'aboutMe': '/aboutMe',
    'youtube-vlog': '/miatube/vlog',
    'youtube-madelog': '/miatube/madaylog',
    'youtube-mybag': '/miatube/mybagPlaylist',
    'miaWeekly': '/post/miaWeekly',
    'myday': '/post/myday',
    'contact': '/contact',
  }

  const targetRoute = routeMap[name]
  if (targetRoute) {
    router.push(targetRoute)
  }

  emit('closeSidebar')
}

function goToNaverBlog() {
  window.open('https://blog.naver.com/mia4956', '_blank')
}

function goToYoutube() {
  window.open('https://www.youtube.com/@miatube3164', '_blank')
}

// onMounted
onMounted(() => {
  initializeDarkMode()
})
</script>

<template>
  <div class="sidebar-wrapper">
    <div class="overlay" @click="onCloseSidebar" />
    <aside class="sidebar">
      <div class="close-button-container">
        <button class="close-button" @click="onCloseSidebar">
          <div class="i-mdi-close icon" />
        </button>
      </div>
      <nav>
        <el-collapse v-model="activeNames">
          <el-collapse-item name="aboutMe" class="no-expand">
            <template #title>
              <div class="flex-center" @click.stop="selectMenu('aboutMe')">
                <div class="i-fluent-emoji-flat:alien header-icon" />
                <span>{{ 'About me' }}</span>
              </div>
            </template>
            <div />
          </el-collapse-item>

          <el-collapse-item name="youtube">
            <template #title>
              <div class="flex-center">
                <div class="i-logos:youtube-icon header-icon" />
                <span>{{ '유튜브' }}</span>
              </div>
            </template>

            <div
              class="menu-item"
              :class="{ active: currentMenu === 'youtube-vlog' }"
              @click="selectMenu('youtube-vlog')"
            >
              <div class="flex-center">
                <div class="i-fluent-emoji-flat:film-frames menu-icon" />
                <span>{{ '브이로그' }}</span>
              </div>
            </div>

            <div
              class="menu-item"
              :class="{ active: currentMenu === 'youtube-madelog' }"
              @click="selectMenu('youtube-madelog')"
            >
              <div class="flex-center">
                <div class="i-fluent-emoji-flat:lemon menu-icon" />
                <span>{{ '마데로그' }}</span>
              </div>
            </div>

            <div
              class="menu-item"
              :class="{ active: currentMenu === 'youtube-mybag' }"
              @click="selectMenu('youtube-mybag')"
            >
              <div class="flex-center">
                <div class="i-fluent-emoji-flat:handbag menu-icon" />
                <span>{{ '왓츠 인 마이 백' }}</span>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item name="post">
            <template #title>
              <div class="flex-center">
                <div class="i-fluent-emoji-flat:newspaper header-icon" />
                <span>{{ '읽을거리들' }}</span>
              </div>
            </template>

            <div
              class="menu-item"
              :class="{ active: currentMenu === 'miaWeekly' }"
              @click="selectMenu('miaWeekly')"
            >
              <div class="flex-center">
                <div class="i-fluent-emoji-flat:heart-hands-medium-light menu-icon" />
                <span>{{ '주간지' }}</span>
              </div>
            </div>
            <div
              class="menu-item"
              :class="{ active: currentMenu === 'myday' }"
              @click="selectMenu('myday')"
            >
              <div class="flex-center">
                <div class="i-fluent-emoji-flat:four-leaf-clover menu-icon" />
                <span>{{ 'myday' }}</span>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item name="contact" class="no-expand">
            <template #title>
              <div class="flex-center" @click.stop="selectMenu('contact')">
                <div class="i-fluent-emoji-flat:satellite-antenna header-icon" />
                <span>{{ 'Contact' }}</span>
              </div>
            </template>
            <div />
          </el-collapse-item>
        </el-collapse>
      </nav>
      <div class="icon-button-group">
        <button class="icon-button" aria-label="모드 전환" @click="toggleDarkMode">
          <div class="icon" :class="[isDark ? 'i-fluent-emoji-flat:sun icon' : 'i-fluent-emoji-flat:waxing-crescent-moon icon']" />
        </button>
        <button class="icon-button" aria-label="네이버 블로그" @click="goToNaverBlog">
          <img src="/icons/blog.svg" alt="네이버 블로그" class="blogIcon">
        </button>
        <button class="icon-button" aria-label="유튜브" @click="goToYoutube">
          <div class="i-logos:youtube-icon icon" />
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.sidebar-wrapper {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
}

.overlay {
  position: fixed;
  inset: 0;
  background: white;
  z-index: 1000;
  display: none;
}

@media (max-width: 768px) {
  .overlay {
    display: block;
    background: rgba(0, 0, 0, 0.5);
    opacity: 1;
    transition: none; /* 애니메이션 제거 */
  }
}

html.dark .overlay {
  background: rgba(0, 0, 0, 0.7) !important;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 360px;
  height: 100dvh;
  background: white;
  border-radius: 0 20px 20px 0;
  z-index: 1001;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  color: #333;
  transform: translateX(0);
  transition: transform 0.3s ease;

  display: flex;
  flex-direction: column;
}

.close-button-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit;
}

.icon,
.header-icon,
.menu-icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
}
.blogIcon {
  font-size: 15px;
  width: 15px;
  height: 15px;
  margin-bottom: 2px;
}
.header-icon,
.menu-icon {
  margin-right: 8px;
}

nav {
  flex: 1;
  overflow-y: auto;
  padding: 24px 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f2f2f2;
}

.menu-item.active {
  background-color: #e0f3ff;
  font-weight: 600;
}

.flex-center {
  display: flex;
  align-items: center;
}

::v-deep(.el-collapse),
::v-deep(.el-collapse-item__header),
::v-deep(.el-collapse-item__wrap) {
  border: none !important;
}

.icon-button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 0 12px;
  margin-top: auto;
}

.icon-button {
  width: 48px;
  height: 48px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 500px;
  transition: background-color 0.2s;
  color: inherit;
}

.icon-button:hover {
  border-radius: 500px;
  background-color: #f2f2f2;
}

/* 화살표 숨기기 */
::v-deep(.el-collapse-item.no-expand .el-collapse-item__arrow) {
  display: none !important;
}

/* 클릭 시 확장 방지 */
::v-deep(.el-collapse-item.no-expand .el-collapse-item__header) {
  cursor: pointer;
}

/* 빈 컨텐츠 영역 숨기기 */
::v-deep(.el-collapse-item.no-expand .el-collapse-item__wrap) {
  display: none !important;
}

/* 모바일에서 위에서 아래로 나타나도록 수정 */
@media (max-width: 768px) {
  .sidebar-wrapper {
    animation: none !important;
    transition: none !important;
  }

  .sidebar {
    top: 0;
    left: 0;
    width: 100%;
    height: 67vh; /* 화면의 2/3 높이 */
    max-height: 67vh;
    border-radius: 0 0 20px 20px; /* 아래쪽만 둥글게 */
    transform: translateY(-100%); /* 위쪽으로 숨김 */
    transition: transform 0.3s ease;
    animation: slideDown 0.3s ease forwards;
  }

  .overlay {
    animation: none !important;
    transition: none !important;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 사이드바가 닫힐 때의 애니메이션 */
.sidebar-wrapper.closing .sidebar {
  animation: slideUp 0.3s ease forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
}
</style>

<style>
html.dark .sidebar {
  background: #181a1b !important;
  color: #f9fafb !important;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3) !important;
}

html.dark .menu-item:hover {
  background-color: rgba(105, 95, 110, 0.6) !important;
}

html.dark .menu-item.active {
  background-color: #5d1eaf !important;
  color: #dbeafe !important;
}

html.dark .icon-button:hover {
  background-color: #333 !important;
}

html.dark .close-button,
html.dark .icon-button {
  color: #f9fafb !important;
}

html.dark .el-collapse-item__header {
  background-color: transparent !important;
  color: #f9fafb !important;
}

html.dark .el-collapse-item__content {
  background-color: transparent !important;
  color: #f9fafb !important;
}

/* 모바일 다크 모드에서 사이드바 그림자 조정 */
@media (max-width: 768px) {
  html.dark .sidebar {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
  }
}
</style>
