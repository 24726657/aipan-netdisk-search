<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">广告管理</h1>
      <el-button type="primary" @click="openAddDialog">添加广告</el-button>
    </div>

    <el-table :data="ads" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="title" label="标题" min-width="150"></el-table-column>
      <el-table-column label="图片" width="120">
        <template #default="{ row }">
          <img v-if="row.imageUrl" :src="row.imageUrl" class="h-12 w-20 object-cover rounded" />
          <span v-else class="text-xs text-gray-400">无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="linkUrl" label="链接" min-width="150" show-overflow-tooltip></el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 'text' ? 'warning' : 'primary'" size="small">
            {{ row.type === 'text' ? '文字' : '图片' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="位置" width="140">
        <template #default="{ row }">
          <el-tag :type="getPositionType(row)" size="small">
            {{ getPositionName(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序值" width="80"></el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" top="5vh">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入广告标题"></el-input>
        </el-form-item>
        <el-form-item v-if="form.type === 'image'" label="图片链接">
          <el-input v-model="form.imageUrl" placeholder="https://img.cdn1.vip/i/xxxxx.webp"></el-input>
          <div class="text-xs text-gray-400 mt-1">建议比例：顶部横幅 5:1，网格广告 4:3</div>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.linkUrl" placeholder="https://example.com"></el-input>
          <div v-if="form.type === 'text'" class="text-xs text-gray-400 mt-1">文字广告的链接为选填</div>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.type" @change="onTypeChange">
            <el-radio-button label="image">图片广告</el-radio-button>
            <el-radio-button label="text">文字广告</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位置">
          <el-radio-group v-model="form.sortOrder">
            <el-radio-button
              v-for="option in currentPositionOptions"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
          <div class="text-xs text-gray-400 mt-1">选择后自动设置排序值</div>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ============================================================
// 位置配置
// ============================================================
const imagePositionMap = {
  0: { name: '顶部横幅 (5:1)', type: 'primary' },
  1: { name: '网格1 (4:3)', type: 'success' },
  2: { name: '网格2 (4:3)', type: 'warning' },
  3: { name: '网格3 (4:3)', type: 'info' },
}

const textPositionMap = {}
for (let i = 1; i <= 10; i++) {
  textPositionMap[i] = { name: `文字广告位${i}`, type: 'info' }
}

const getPositionName = (row) => {
  if (row.type === 'image') {
    return imagePositionMap[row.sortOrder]?.name || `其他(${row.sortOrder})`
  } else {
    return textPositionMap[row.sortOrder]?.name || `其他(${row.sortOrder})`
  }
}

const getPositionType = (row) => {
  if (row.type === 'image') {
    return imagePositionMap[row.sortOrder]?.type || ''
  } else {
    return textPositionMap[row.sortOrder]?.type || ''
  }
}

// ============================================================
// Token 获取 & 认证请求
// ============================================================
const getToken = () => {
  const cookies = document.cookie.split('; ').reduce((acc, cur) => {
    const [key, val] = cur.split('=')
    acc[key] = decodeURIComponent(val)
    return acc
  }, {})
  let token = cookies.token || ''
  if (!token) {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        token = user.token || ''
      }
    } catch (e) {}
  }
  return token
}

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
const submitting = ref(false)

const form = reactive({
  id: null,
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  status: true,
  type: 'image',
})

const currentPositionOptions = computed(() => {
  if (form.type === 'image') {
    return [
      { label: '顶部横幅 (5:1)', value: 0 },
      { label: '网格1 (4:3)', value: 1 },
      { label: '网格2 (4:3)', value: 2 },
      { label: '网格3 (4:3)', value: 3 },
    ]
  } else {
    return Array.from({ length: 10 }, (_, i) => ({
      label: `文字广告位${i + 1}`,
      value: i + 1
    }))
  }
})

const onTypeChange = () => {
  if (form.type === 'image') {
    form.sortOrder = 0
  } else {
    form.sortOrder = 1
    form.imageUrl = ''
  }
}

const fetchAds = async () => {
  try {
    const res = await $fetchWithAuth('/api/admin/ads')
    ads.value = res.data || []
  } catch (err) {
    console.error('获取广告列表失败:', err)
    ElMessage.error('获取广告列表失败，请刷新重试')
  }
}

const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加广告'
  Object.assign(form, {
    id: null,
    title: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: 0,
    status: true,
    type: 'image',
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑广告'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.title) {
    ElMessage.warning('请输入广告标题')
    return
  }
  if (form.type === 'image' && !form.imageUrl) {
    ElMessage.warning('请输入图片链接')
    return
  }

  submitting.value = true
  try {
    const payload = { ...form }
    if (payload.type === 'text') {
      payload.imageUrl = ''
    }
    if (isEdit.value) {
      await $fetchWithAuth(`/api/admin/ads/${form.id}`, {
        method: 'PUT',
        body: payload
      })
      ElMessage.success('更新成功')
    } else {
      await $fetchWithAuth('/api/admin/ads', {
        method: 'POST',
        body: payload
      })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    await fetchAds()
  } catch (err) {
    console.error('提交广告失败:', err)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    submitting.value = false
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