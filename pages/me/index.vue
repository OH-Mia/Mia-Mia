<!-- pages/index.vue -->
<script setup>
const count = ref(0)

function reset() {
  count.value = 0
}
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>🐰</h1>
    </header>
    <main class="main">
      <div class="card">
        <h2>안녕하세요!</h2>
        <p>이 프로젝트는 완전 미니멀하게 시작되었습니다.</p>
        <p>필요한 기능들을 하나씩 추가해나가세요.</p>

        <div class="buttons">
          <button class="btn" @click="count++">
            클릭: {{ count }}
          </button>
          <button class="btn btn-secondary" @click="reset">
            리셋
          </button>
        </div>
      </div>
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

.header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 3rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0.5rem 0 0 0;
}

.main {
  width: 100%;
  max-width: 500px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  text-align: center;
}

.card h2 {
  color: #333;
  margin-top: 0;
}

.card p {
  color: #666;
  line-height: 1.6;
  margin: 1rem 0;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #667eea;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f1f3f4;
  color: #333;
}

.btn-secondary:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
