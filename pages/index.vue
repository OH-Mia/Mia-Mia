<!-- pages/index.vue -->
<script setup>
definePageMeta({
  layout: 'default',
  type: 'route',
})
</script>

<template>
  <el-card>
    <h2>안녕하세요!</h2>
    <p>이 프로젝트는 완전 미니멀하게 시작되었습니다.</p>
    <p>필요한 기능들을 하나씩 추가해나가세요.</p>

    <div class="buttons">
      <button class="btn">
        유튜브
      </button>
      <button class="btn btn-secondary">
        블로그
      </button>
    </div>
  </el-card>
</template>

<style scoped>
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
