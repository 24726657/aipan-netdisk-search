<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">广告管理</h1>
      <el-button type="primary" @click="openAddDialog">添加广告</el-button>
    </div>

    <el-table :data="ads" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="title" label="标题" min-width="120"></el-table-column>
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <img v-if="row.imageUrl" :src="row.imageUrl" class="h-12 w-20 object-cover rounded" />
          <span v-else class="text-xs text-gray-400">无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.type === 'text' ? 'warning' : 'primary'" size="small">
            {{ row.type === 'text' ? '文字' : '图片' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="位置" width="130">
        <template #default="{ row }">
          <el-tag :type="getPositionType(row)" size="small">
            {{ getPositionName(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="160">
        <template #default="{ row }">
          <span class="text-xs">{{ row.startTime ? formatDate(row.startTime) : '立即生效' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" width="160">
        <template #default="{ row }">
          <span class="text-xs">{{ row.endTime ? formatDate(row.endTime) : '永久有效' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row)" size="small">
            {{ getStatusText(row) }}
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="620px" top="5vh">
      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入广告标题"></el-input>
        </el-form-item>
        <el-form-item v-if="form.type === 'image'" label="图片链接">
          <el-input v-model="form.imageUrl" placeholder="https://img.cdn1.vip/i/xxxxx.webp"></el-input>
          <div class="text-xs text-gray-400 mt-1">建议比例：顶部横幅 7:1，网格广告 7:2</div>
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
        </el-form-item>

        <!-- 开始时间 -->
        <el-form-item label="开始时间">
          <input
            type="datetime-local"
            v-model="form.startTime"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <div class="text-xs text-gray-400 mt-1">留空表示立即生效</div>
        </el-form-item>

        <!-- 结束时间 -->
        <el-form-item label="结束时间">
          <input
            type="datetime-local"
            v-model="form.endTime"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <div class="text-xs text-gray-400 mt-1">留空表示永久有效，到达结束时间后自动下架</div>
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

import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ============================================================
// 位置配置
// ============================================================
const imagePositionMap = {
  0: { name: '顶部横幅 (7:1)', type: 'primary' },
  1: { name: '网格1 (7:2)', type: 'success' },
  2: { name: '网格2 (7:2)', type: 'warning' },
  3: { name: '网格3 (7:2)', type: 'info' },
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
// 日期格式化工具函数
// ============================================================
// 显示日期（表格中使用）
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 数据库时间 -> datetime-local 输入框格式 (YYYY-MM-DDTHH:mm)
// 数据库格式: YYYY-MM-DD HH:mm:ss
// 输出格式: YYYY-MM-DDTHH:mm
const formatForInput = (dateStr) => {
  if (!dateStr) return null
  // 截取前16个字符，去掉秒，替换空格为T
  return dateStr.replace(' ', 'T').slice(0, 16)
}

// datetime-local 输入框格式 -> 数据库格式 (YYYY-MM-DD HH:mm:ss)
// 输入格式: YYYY-MM-DDTHH:mm 或 YYYY-MM-DDTHH:mm:ss
// 输出格式: YYYY-MM-DD HH:mm:ss
const formatForServer = (dateStr) => {
  if (!dateStr || dateStr === '') return null
  // 替换 T 为空格，补齐秒
  let result = dateStr.replace('T', ' ')
  // 如果只有到分钟，补上 :00
  if (result.length === 16) {
    result = result + ':00'
  }
  return result
}

// ============================================================
// 状态判断工具函数
// ============================================================
const getStatusType = (row) => {
  const now = new Date()
  if (!row.status) return 'danger'
  if (row.startTime && new Date(row.startTime) > now) return 'warning'
  if (row.endTime && new Date(row.endTime) < now) return 'danger'
  return 'success'
}

const getStatusText = (row) => {
  const now = new Date()
  if (!row.status) return '已下架'
  if (row.startTime && new Date(row.startTime) > now) return '待生效'
  if (row.endTime && new Date(row.endTime) < now) return '已过期'
  return '生效中'
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
const formRef = ref(null)

const form = reactive({
  id: null,
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  status: true,
  type: 'image',
  startTime: null,
  endTime: null,
})

const currentPositionOptions = computed(() => {
  if (form.type === 'image') {
    return [
      { label: '顶部横幅 (7:1)', value: 0 },
      { label: '网格1 (7:2)', value: 1 },
      { label: '网格2 (7:2)', value: 2 },
      { label: '网格3 (7:2)', value: 3 },
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

// ============================================================
// 打开新增/编辑对话框
// ============================================================
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
    startTime: null,
    endTime: null,
  })
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑广告'

  // 将数据库时间格式转为 datetime-local 输入框可识别的格式
  const startTime = formatForInput(row.startTime)
  const endTime = formatForInput(row.endTime)

  Object.assign(form, {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl || '',
    linkUrl: row.linkUrl || '',
    sortOrder: row.sortOrder,
    status: row.status,
    type: row.type || 'image',
    startTime: startTime,
    endTime: endTime,
  })
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// ============================================================
// 提交表单
// ============================================================
const submitForm = async () => {
  if (!form.title) {
    ElMessage.warning('请输入广告标题')
    return
  }
  if (form.type === 'image' && !form.imageUrl) {
    ElMessage.warning('请输入图片链接')
    return
  }

  // 转换时间格式：空值转为 null
  const startTime = formatForServer(form.startTime)
  const endTime = formatForServer(form.endTime)

  // 校验时间：结束时间必须大于开始时间
  if (startTime && endTime) {
    if (new Date(endTime) <= new Date(startTime)) {
      ElMessage.warning('结束时间必须晚于开始时间')
      return
    }
  }

  submitting.value = true
  try {
    const payload = {
      title: form.title,
      type: form.type,
      linkUrl: form.linkUrl || '',
      sortOrder: form.sortOrder,
      status: form.status,
      startTime: startTime,
      endTime: endTime,
      imageWidth: 0,
      imageHeight: 0,
    }

    if (form.type === 'image') {
      payload.imageUrl = form.imageUrl
    } else {
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
    ElMessage.error(err?.data?.msg || err?.message || '操作失败，请稍后重试')
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

<style scoped>
input[type="datetime-local"] {
  background-color: #fff;
  color: #1f2937;
  font-size: 14px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  box-sizing: border-box;
}

input[type="datetime-local"]:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  padding: 4px;
}

:root.dark input[type="datetime-local"] {
  background-color: #1f2937;
  color: #e5e7eb;
  border-color: #4b5563;
}

:root.dark input[type="datetime-local"]:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}
</style>