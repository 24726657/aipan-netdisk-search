<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">友情链接管理</h1>
      <el-button type="primary" @click="openAddDialog">添加链接</el-button>
    </div>

    <el-table :data="links" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column label="Logo" width="70">
        <template #default="{ row }">
          <img v-if="row.logo" :src="row.logo" class="h-8 w-8 object-contain rounded" />
          <span v-else class="text-xs text-gray-400">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="网站名称" min-width="120"></el-table-column>
      <el-table-column prop="url" label="链接地址" min-width="180" show-overflow-tooltip></el-table-column>
      <el-table-column prop="description" label="描述" min-width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="70"></el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'" size="small">
            {{ row.status ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" :type="row.status ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px" top="5vh">
      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="网站名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入网站名称"></el-input>
        </el-form-item>
        <el-form-item label="链接地址" prop="url">
          <el-input v-model="form.url" placeholder="https://example.com"></el-input>
        </el-form-item>
        <el-form-item label="Logo 地址">
          <el-input v-model="form.logo" placeholder="https://example.com/logo.png（可选）"></el-input>
        </el-form-item>
        <el-form-item label="网站描述">
          <el-input v-model="form.description" placeholder="简短描述（可选）" maxlength="200"></el-input>
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="form.sortOrder" :min="0" :step="1" />
          <div class="text-xs text-gray-400 mt-1">数值越小越靠前</div>
        </el-form-item>
        <el-form-item label="打开方式">
          <el-radio-group v-model="form.target">
            <el-radio label="_blank">新窗口打开</el-radio>
            <el-radio label="_self">当前窗口打开</el-radio>
          </el-radio-group>
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

import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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

const links = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  url: '',
  logo: '',
  description: '',
  sortOrder: 0,
  status: true,
  target: '_blank',
})

const fetchLinks = async () => {
  try {
    const res = await $fetchWithAuth('/api/admin/links')
    links.value = res.data || []
  } catch (err) {
    console.error('获取链接列表失败:', err)
    ElMessage.error('获取列表失败，请刷新重试')
  }
}

const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加友情链接'
  Object.assign(form, {
    id: null,
    name: '',
    url: '',
    logo: '',
    description: '',
    sortOrder: 0,
    status: true,
    target: '_blank',
  })
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑友情链接'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    url: row.url,
    logo: row.logo || '',
    description: row.description || '',
    sortOrder: row.sortOrder,
    status: row.status,
    target: row.target || '_blank',
  })
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const submitForm = async () => {
  if (!form.name) {
    ElMessage.warning('请输入网站名称')
    return
  }
  if (!form.url) {
    ElMessage.warning('请输入链接地址')
    return
  }
  if (!form.url.startsWith('http://') && !form.url.startsWith('https://')) {
    ElMessage.warning('链接地址必须以 http:// 或 https:// 开头')
    return
  }

  submitting.value = true
  try {
    const payload = { ...form }
    if (isEdit.value) {
      await $fetchWithAuth(`/api/admin/links/${form.id}`, {
        method: 'PUT',
        body: payload
      })
      ElMessage.success('更新成功')
    } else {
      await $fetchWithAuth('/api/admin/links', {
        method: 'POST',
        body: payload
      })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    await fetchLinks()
  } catch (err) {
    console.error('提交失败:', err)
    ElMessage.error(err?.data?.message || '操作失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (row) => {
  try {
    await $fetchWithAuth(`/api/admin/links/${row.id}/toggle`, {
      method: 'POST',
      body: { status: !row.status }
    })
    ElMessage.success(`已${row.status ? '禁用' : '启用'}`)
    await fetchLinks()
  } catch (err) {
    ElMessage.error('切换状态失败，请重试')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除「${row.name}」？`, '提示', { type: 'warning' })
    await $fetchWithAuth(`/api/admin/links/${row.id}`, {
      method: 'DELETE'
    })
    ElMessage.success('删除成功')
    await fetchLinks()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

onMounted(fetchLinks)
</script>