<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">广告管理</h1>
      <el-button type="primary" @click="openAddDialog">添加广告</el-button>
    </div>

    <el-table :data="ads" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" min-width="150" />
      <el-table-column label="图片" width="120">
        <template #default="{ row }">
          <img :src="row.imageUrl" class="h-12 w-20 object-cover rounded" />
        </template>
      </el-table-column>
      <el-table-column prop="linkUrl" label="链接" min-width="150" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">
            {{ row.status ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" :type="row.status ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="图片链接">
          <el-input v-model="form.imageUrl" placeholder="https://example.com/ad.jpg" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.linkUrl" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ============================================================
// 获取 Token
// ============================================================
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || ''
}

// ============================================================
// 带认证的 $fetch 封装
// ============================================================
const $fetchWithAuth = (url, options = {}) => {
  const token = getToken()
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
  return $fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  })
}

// ============================================================
// 组件逻辑
// ============================================================
const ads = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const form = reactive({
  id: null,
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  status: true,
})

const fetchAds = async () => {
  try {
    const res = await $fetchWithAuth('/api/admin/ads')
    ads.value = res.data
  } catch (err) {
    console.error('获取广告列表失败:', err)
    ElMessage.error('获取广告列表失败，请刷新重试')
  }
}

const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加广告'
  Object.assign(form, { id: null, title: '', imageUrl: '', linkUrl: '', sortOrder: 0, status: true })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑广告'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await $fetchWithAuth(`/api/admin/ads/${form.id}`, {
        method: 'PUT',
        body: form
      })
      ElMessage.success('更新成功')
    } else {
      await $fetchWithAuth('/api/admin/ads', {
        method: 'POST',
        body: form
      })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    await fetchAds()
  } catch (err) {
    console.error('提交广告失败:', err)
    ElMessage.error('操作失败，请稍后重试')
  }
}

const toggleStatus = async (row) => {
  try {
    await $fetchWithAuth(`/api/admin/ads/${row.id}/toggle`, {
      method: 'POST'
    })
    ElMessage.success(`已${row.status ? '下架' : '上架'}`)
    await fetchAds()
  } catch (err) {
    ElMessage.error('切换状态失败，请重试')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除此广告？', '提示', { type: 'warning' })
    await $fetchWithAuth(`/api/admin/ads/${row.id}`, {
      method: 'DELETE'
    })
    ElMessage.success('删除成功')
    await fetchAds()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

onMounted(fetchAds)
</script>