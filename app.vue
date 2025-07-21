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
  font-family: 'Playfair Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

html.dark body {
  background: rgb(80, 73, 83) !important;
  color: #f9fafb !important;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3) !important;
}

/* 모든 아이콘에 기본 색상 적용 */
[class*="i-"] {
  color: #555;
}

/* 다크 모드일 때 아이콘 색상 */
html.dark [class*="i-"] {
  color: #f9fafb !important;
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

/*
  유튜브 하위 메뉴
  상세 페이지 다크모드 스타일
 */
html.dark .video-page {
  background: rgb(32, 25, 35);
  color: #f9fafb;
}

html.dark .back-button {
  color: #d1d5db !important;
}

html.dark .back-button:hover {
  background: rgb(69, 55, 81) !important;
  color: #f9fafb !important;
}

html.dark .video-info {
  background: rgb(80, 73, 83) !important;
  color: #f9fafb !important;
}

html.dark .video-title {
  color: #f9fafb !important;
}

html.dark .video-meta,
html.dark .publish-date {
  color: #d1d5db !important;
}

html.dark .video-description {
  color: #e5e7eb !important;
}

html.dark .comments-section {
  background: rgb(80, 73, 83) !important;
  color: #f9fafb !important;
}

html.dark .comments-header {
  border-bottom: 1px solid rgba(156, 163, 175, 0.2) !important;
}

html.dark .comments-title {
  color: #f9fafb !important;
}

html.dark .comments-count {
  background: rgb(69, 55, 81) !important;
  color: #d1d5db !important;
}

html.dark .comment-item {
  border-bottom: 1px solid rgba(156, 163, 175, 0.2) !important;
}

html.dark .comment-item:hover {
  background: rgba(105, 95, 110, 0.3) !important;
}

html.dark .comment-author {
  color: #f9fafb !important;
}

html.dark .comment-date {
  color: #d1d5db !important;
}

html.dark .comment-text {
  color: #e5e7eb !important;
}

html.dark .comment-text a {
  color: #8b5cf6 !important;
}

html.dark .load-more-button {
  background: transparent !important;
  border-color: #5d1eaf !important;
  color: #8b5cf6 !important;
}

html.dark .load-more-button:hover {
  background: #5d1eaf !important;
  color: #dbeafe !important;
  box-shadow: 0 4px 12px rgba(93, 30, 175, 0.3) !important;
}

html.dark .loading-more {
  color: #d1d5db !important;
}

html.dark .no-comments {
  color: #d1d5db !important;
}

html.dark .el-empty {
  --el-empty-description-color: #9ca3af !important;
}

html.dark .error-container {
  background: rgb(32, 25, 35);
}

html.dark .el-result {
  --el-text-color-primary: #f9fafb !important;
  --el-text-color-regular: #d1d5db !important;
}

html.dark .el-skeleton__item {
  background: linear-gradient(90deg, rgb(69, 55, 81) 25%, rgb(85, 75, 90) 37%, rgb(69, 55, 81) 63%) !important;
}

html.dark .el-skeleton {
  --el-skeleton-color: rgb(69, 55, 81) !important;
  --el-skeleton-to-color: rgb(85, 75, 90) !important;
}
</style>
