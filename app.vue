<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
* {
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
  max-width: 100%;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 모든 아이콘에 기본 색상 적용 */
[class*="i-"] {
  color: #555;
}

/* 모바일에서 확대 방지 */
@media (max-width: 768px) {
  html, body {
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  /* 필요한 요소는 선택 가능하게 */
  input, textarea, select, button {
    -webkit-user-select: auto;
    user-select: auto;
  }
}
</style>
