<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

definePageMeta({
  layout: 'default',
  type: 'route',
})

const keyword = ref('')
const selectedCategory = ref('all')

const categoryOptions = [
  { label: '전체', value: 'all' },
  { label: '마이데이', value: '마이데이' },
  { label: 'diary', value: 'diary' },
]

const tableData = ref<
  {
    id: number
    category: string
    title: string
    description: string
  }[]
>([])

const searchStore = useNaverSearchStore()
const firebaseSearchStore = useFirebaseSearchStore()

async function onSearch() {
  if (!keyword.value.trim()) {
    ElMessage.warning('검색어를 입력하세요.')
    return
  }

  // await searchStore.searchBlog(selectedCategory.value, keyword.value)
  // tableData.value = searchStore.blogResults.items.map((v, index) => ({
  //   id: index + 1,
  //   category: selectedCategory.value,
  //   title: v.title,
  //   description: v.description,
  // }))
  await firebaseSearchStore.fetchCachedResults(`${selectedCategory.value}/${keyword.value}`)
}

function onReset() {
  keyword.value = ''
  selectedCategory.value = 'all'
  tableData.value = []
}
</script>

<template>
  <div class="admin-page">
    <div class="search-bar">
      <el-select v-model="selectedCategory" placeholder="카테고리 선택" size="large" class="select-box">
        <el-option
          v-for="item in categoryOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-input
        v-model="keyword"
        placeholder="검색어 입력"
        size="large"
        class="search-input"
      />

      <el-button type="primary" size="large" @click="onSearch">
        검색
      </el-button>

      <el-button size="large" @click="onReset">
        초기화
      </el-button>
    </div>

    <el-table :data="tableData" border stripe class="result-table">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="category" label="카테고리" width="120" />
      <el-table-column prop="title" label="제목" />
      <el-table-column prop="description" label="설명" />
    </el-table>
  </div>
</template>

<style scoped>
.admin-page {
  width: 1024px;
  margin: 0 auto;
  padding: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: nowrap;
  align-items: center;
}

.select-box {
  width: 150px;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.result-table {
  width: 100%;
  min-height: 500px;
}
</style>
