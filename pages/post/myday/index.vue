<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

definePageMeta({
  layout: 'default',
  type: 'route',
})

const tableData = ref<
  {
    id: number
    title: string
    description: string
    link: string
    postdate: string
    bloggername: string
  }[]
>([])

const searchStore = useNaverSearchStore()

// 화면 크기에 따른 skeleton 개수 계산
const skeletonCount = computed(() => {
  // 기본적으로 화면을 꽉 채울 수 있는 개수 계산
  // 데스크톱: 3열 기준으로 3-4줄, 태블릿: 2열 기준으로 4-5줄, 모바일: 1열 기준으로 6-8줄
  if (process.client) {
    const width = window.innerWidth
    if (width >= 1200)
      return 15 // 대형 화면: 5행 x 3열
    if (width >= 900)
      return 12 // 중형 화면: 4행 x 3열
    if (width >= 600)
      return 10 // 태블릿: 5행 x 2열
    return 8 // 모바일: 8행 x 1열
  }
  return 12 // SSR 기본값
})

async function onSearch() {
  try {
    await searchStore.searchBlog('마이데이 브이로그', 1, 150)

    if (searchStore.error) {
      ElMessage.error(searchStore.error)
      return
    }

    if (searchStore.blogResults?.items) {
      tableData.value = searchStore.blogResults.items.map((v, index) => ({
        id: index + 1,
        title: v.title,
        description: v.description,
        link: v.link,
        postdate: v.postdate || '',
        bloggername: v.bloggername || 'mia4956',
      }))
        .sort((a, b) => {
          const dateA = new Date(a.postdate || 0)
          const dateB = new Date(b.postdate || 0)
          return dateB - dateA // 최신순 (내림차순)
        })

      if (tableData.value.length === 0) {
        ElMessage.info('블로그에서 해당 검색어로 작성된 글을 찾을 수 없습니다.')
      }
    }
  }
  catch (error) {
    console.error('검색 오류:', error)
    ElMessage.error('검색 중 오류가 발생했습니다.')
  }
}

function openLink(url: string) {
  window.open(url, '_blank')
}

// 날짜 포맷팅 함수
function formatDate(dateStr: string) {
  if (!dateStr)
    return ''

  // YYYY-MM-DD 형식을 YYYY.MM.DD로 변환
  return dateStr.replace(/-/g, '.')
}

onMounted(() => onSearch())
</script>

<template>
  <div class="blog-page">
    <!-- 스켈레톤 로딩 -->
    <div v-if="searchStore.loading" class="loading-container">
      <div class="card-grid">
        <div v-for="n in skeletonCount" :key="n" class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-title" />
          </div>
          <div class="skeleton-content">
            <div class="skeleton-line" />
            <div class="skeleton-line" />
            <div class="skeleton-line short" />
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-date" />
          </div>
        </div>
      </div>
    </div>

    <!-- 블로그 카드 그리드 -->
    <div v-else-if="tableData.length > 0" class="card-grid">
      <article
        v-for="item in tableData"
        :key="item.id"
        class="blog-card"
        @click="openLink(item.link)"
      >
        <!-- 카드 헤더 -->
        <div class="card-header">
          <h3 class="card-title">
            {{ item.title }}
          </h3>
        </div>

        <!-- 카드 내용 -->
        <div class="card-content">
          <p class="card-description">
            {{ item.description }}
          </p>
        </div>

        <!-- 카드 푸터 -->
        <div class="card-footer">
          <div class="date-info">
            <Icon name="i-fluent-emoji-flat:calendar" class="date-icon" />
            <span class="post-date">{{ formatDate(item.postdate) }}</span>
          </div>
        </div>

        <!-- 호버 효과용 오버레이 -->
        <div class="card-overlay" />
      </article>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <Icon name="i-fluent-emoji-flat:crying-face" class="empty-icon" />
        <h3>검색 결과가 없습니다</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  height: calc(100dvh - 70px);
}

.loading-container {
  width: 100%;
  min-height: calc(100vh - 4rem); /* 패딩 제외한 전체 높이 */
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.blog-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 280px; /* 최소 높이 보장 */
}

.blog-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #e2e8f0;
}

.blog-card:hover .card-overlay {
  opacity: 1;
}

.blog-card:hover .arrow-icon {
  transform: translateX(4px);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.card-header {
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.4;
  color: #1e293b;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3.5rem;
}

.card-content {
  margin-bottom: 1.5rem;
  flex: 1;
}

.card-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 4.5rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-icon {
  font-size: 1rem;
  color: #f59e0b;
}

.post-date {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* 스켈레톤 로딩 스타일 */
.skeleton-card {
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: skeleton-fade 1.5s ease-in-out infinite alternate;
}

@keyframes skeleton-fade {
  0% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes skeleton-shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.skeleton-header {
  margin-bottom: 1rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 85%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton-shimmer 2s infinite;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.skeleton-content {
  flex: 1;
  margin-bottom: 1.5rem;
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton-shimmer 2s infinite;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-footer {
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.skeleton-date {
  height: 0.875rem;
  width: 120px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton-shimmer 2s infinite;
  border-radius: 6px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
}

.empty-content {
  max-width: 300px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-content h3 {
  font-size: 1.5rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-content p {
  color: #6b7280;
  font-size: 1rem;
}

/* 다크 모드 */
html.dark .blog-card {
  background: rgba(102, 102, 102, 0.1);
  border-color: #374151;
}

html.dark .blog-card:hover {
  border-color: #4b5563;
}

html.dark .card-title {
  color: #f9fafb;
}

html.dark .card-description {
  color: #d1d5db;
}

html.dark .card-footer {
  border-color: #374151;
}

html.dark .post-date {
  color: #9ca3af;
}

html.dark .empty-content h3 {
  color: #f9fafb;
}

html.dark .empty-content p {
  color: #d1d5db;
}

html.dark .skeleton-card {
  background: #1f2937;
  border-color: #374151;
}

html.dark .skeleton-footer {
  border-color: #374151;
}

html.dark .skeleton-title,
html.dark .skeleton-line,
html.dark .skeleton-date {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200px 100%;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .blog-page {
    padding: 1.5rem;
  }

  .loading-container {
    min-height: calc(100vh - 3rem);
  }

  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .blog-card {
    padding: 1.25rem;
    min-height: 260px;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .card-description {
    font-size: 0.9rem;
    -webkit-line-clamp: 2;
    min-height: 3rem;
  }
}

@media (max-width: 480px) {
  .blog-page {
    padding: 1rem;
  }

  .loading-container {
    min-height: calc(100vh - 2rem);
  }

  .card-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .blog-card {
    padding: 1rem;
    min-height: 240px;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .skeleton-card {
    padding: 1rem;
    min-height: 240px;
  }
}
</style>
