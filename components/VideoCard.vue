<script setup lang="ts">
interface Props {
  card: YoutubeVideoItem
}

interface Emits {
  (e: 'click', card: YoutubeVideoItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleClick() {
  emit('click', props.card)
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src !== props.card.thumbnailFallback) {
    img.src = props.card.thumbnailFallback
  }
}
</script>

<template>
  <el-card
    class="card-item"
    shadow="hover"
    @click="handleClick"
  >
    <div class="card-content">
      <el-image
        :src="card.thumbnail"
        :fallback="card.thumbnailFallback"
        fit="cover"
        class="thumbnail"
        lazy
        @error="handleImageError"
      />
      <div class="info-overlay">
        <h3 class="title">
          {{ card.title }}
        </h3>
        <p class="date">
          {{ new Date(card.publishedAt).toLocaleDateString() }}
        </p>
      </div>
      <!-- 재생 아이콘 추가 -->
      <div class="i-material-symbols:play-arrow-rounded play-icon" />
    </div>
  </el-card>
</template>

<style scoped>
.card-item {
  overflow: hidden;
  min-height: 200px;
  height: 380px;
  border-radius: 20px;
  cursor: pointer;
}

.card-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-item:hover .play-icon {
  width: 50px;
  height: 50px;
  opacity: 1;
}

.card-item:hover .thumbnail {
  opacity: 0.8;
}

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

.card-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 20px;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease;
}

.info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%);
  padding: 20px 16px 16px;
  color: white;
}

.title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
  color: white;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  padding: 12px;
  backdrop-filter: blur(10px);
  pointer-events: none;
}

@media (max-width: 480px) {
  .card-item {
    height: 500px;
  }
  .title {
    font-size: 0.85rem;
  }

  .date {
    font-size: 0.75rem;
  }

  .info-overlay {
    padding: 16px 12px 12px;
  }
}
</style>
