<!-- components/Sidebar.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['closeSidebar'])

// 상태
const activeNames = ref('blog')
const currentMenu = ref('') // 클릭된 서브 메뉴 상태

// 닫기
function onCloseSidebar() {
  emit('closeSidebar')
}

// 메뉴 클릭
function selectMenu(name: string) {
  currentMenu.value = name
  // emit('closeSidebar')
}
</script>

<template>
  <aside class="sidebar">
    <div class="close-button-container">
      <button class="close-button" @click="onCloseSidebar">
        <div class="i-mdi-close icon" />
      </button>
    </div>
    <nav>
      <el-collapse v-model="activeNames">
        <el-collapse-item name="youtube">
          <template #title>
            <div class="flex-center">
              <div class="i-material-symbols:smart-display-rounded header-icon" />
              <span>{{ '유튜브' }}</span>
            </div>
          </template>

          <div
            class="menu-item"
            :class="{ active: currentMenu === 'youtube-vlog' }"
            @click="selectMenu('youtube-vlog')"
          >
            <div class="flex-center">
              <div class="i-material-symbols:photo-camera-rounded menu-icon" />
              <span>{{ '브이로그' }}</span>
            </div>
          </div>

          <div
            class="menu-item"
            :class="{ active: currentMenu === 'youtube-madelog' }"
            @click="selectMenu('youtube-madelog')"
          >
            <div class="flex-center">
              <div class="i-material-symbols:mic-rounded menu-icon" />
              <span>{{ '마데로그' }}</span>
            </div>
          </div>

          <div
            class="menu-item"
            :class="{ active: currentMenu === 'youtube-playlist' }"
            @click="selectMenu('youtube-playlist')"
          >
            <div class="flex-center">
              <div class="i-material-symbols:queue-music-rounded menu-icon" />
              <span>{{ '플레이리스트' }}</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item name="admin">
          <template #title>
            <div class="flex-center">
              <div class="i-material-symbols:settings-rounded header-icon" />
              <span>{{ '관리자' }}</span>
            </div>
          </template>

          <div
            class="menu-item"
            :class="{ active: currentMenu === 'admin-files' }"
            @click="selectMenu('admin-files')"
          >
            <div class="flex-center">
              <div class="i-material-symbols:folder-rounded menu-icon" />
              <span>{{ '파일 관리' }}</span>
            </div>
          </div>
          <div
            class="menu-item"
            :class="{ active: currentMenu === 'admin-blog' }"
            @click="selectMenu('admin-blog')"
          >
            <div class="flex-center">
              <div class="i-material-symbols:build-rounded menu-icon" />
              <span>{{ '블로그 관리' }}</span>
            </div>
          </div>
          <div
            class="menu-item"
            :class="{ active: currentMenu === 'admin-youtube' }"
            @click="selectMenu('admin-youtube')"
          >
            <div class="flex-center">
              <div class="i-mdi:monitor menu-icon" />
              <span>{{ '유튜브 관리' }}</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </nav>
    <div class="icon-button-group">
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
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 360px;
  height: 100vh;
  background: white;
  border-radius: 0 20px 20px 0;
  z-index: 1001;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

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
}

.icon,
.header-icon,
.menu-icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
}
.header-icon,
.menu-icon {
  margin-right: 8px;
}

nav {
  flex: 1;
  overflow-y: auto;
  padding: 24px 12px;

  /* border: 1px solid black; */
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
}

.icon-button:hover {
  border-radius: 500px;
  background-color: #f2f2f2;
}

/* 모바일일 때 전체 너비로 확장 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    border-radius: 0;
  }
}
</style>
