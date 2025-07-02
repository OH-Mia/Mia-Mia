<!-- layout/default.vue -->
<script setup>
import Header from '~/components/Header.vue'
</script>

<template>
  <div class="container">
    <Header />
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main {
  width: 100%;
}
</style>
