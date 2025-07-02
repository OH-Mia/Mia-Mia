<!-- components/Sidebar.vue -->
<script setup lang="ts">
const emit = defineEmits(['closeSidebar'])

function onCloseSidebar() {
  emit('closeSidebar')
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
      <!-- <ul>
        <li>메뉴1</li>
        <li>메뉴2</li>
        <li>메뉴3</li>
      </ul> -->
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: white;
  border-radius: 0 20px 20px 0;
  z-index: 1001;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
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

.icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
}

/* 모바일일 때 전체 너비로 확장 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    border-radius: 0;
  }
}
</style>
