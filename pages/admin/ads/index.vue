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
      <!-- 新增：图片比例列 -->
      <el-table-column label="图片比例" width="110">
        <template #default="{ row }">
          <span v-if="row.type === 'image' && row.imageWidth && row.imageHeight" class="text-xs">
            {{ row.imageWidth }}:{{ row.imageHeight }}
            <el-tag
              :type="isValidRatio(row) ? 'success' : 'danger'"
              size="small"
              class="ml-1"
            >
              {{ isValidRatio(row) ? '✓' : '✗' }}
            </el-tag>
          </span>
          <span v-else class="text-xs text-gray-400">-</span>
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

    <!-- ============================================================
         新增/编辑对话框（已添加图片比例校验）
         ============================================================ -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" top="5vh">
      <el-form :model="form" label-width="100px" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入广告标题"></el-input>
        </el-form-item>

        <!-- 类型 -->
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type" @change="onTypeChange">
            <el-radio-button label="image">图片广告</el-radio-button>
            <el-radio-button label="text">文字广告</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 图片上传：仅图片广告时显示 -->
        <el-form-item v-if="form.type === 'image'" label="广告图片" prop="imageUrl">
          <div class="flex flex-col gap-2">
            <!-- 使用 el-upload 做前端预览 + 尺寸读取 -->
            <el-upload
              ref="uploadRef"
              class="ad-image-upload"
              :auto-upload="false"
              :limit="1"
              :on-change="handleImageChange"
              :on-remove="handleImageRemove"
              list-type="picture-card"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <!-- 或手动输入链接 -->
            <el-input
              v-model="form.imageUrl"
              placeholder="或直接粘贴图片链接 https://example.com/ad.jpg"
              class="mt-1"
              @input="onImageUrlInput"
            />
            <!-- 比例校验提示 -->
            <div v-if="imageRatioError" class="text-xs text-red-500 mt-1">
              {{ imageRatioError }}
            </div>
            <div v-else-if="imageRatioValid && form.imageUrl" class="text-xs text-green-500 mt-1">
              ✅ 图片比例符合要求（{{ getRequiredRatioLabel(form.sortOrder) }}）
            </div>
            <div v-else-if="form.imageUrl && !imageRatioValid && !imageRatioError" class="text-xs text-gray-400 mt-1">
              ⏳ 正在读取图片尺寸...
            </div>
            <div class="text-xs text-gray-400 mt-1">
              要求比例：{{ getRequiredRatioLabel(form.sortOrder) }}
            </div>
          </div>
        </el-form-item>

        <!-- 跳转链接 -->
        <el-form-item label="跳转链接" prop="linkUrl">
          <el-input v-model="form.linkUrl" placeholder="https://example.com"></el-input>
          <div v-if="form.type === 'text'" class="text-xs text-gray-400 mt-1">文字广告的链接为选填</div>
        </el-form-item>

        <!-- 位置 -->
        <el-form-item label="位置" prop="sortOrder">
          <el-radio-group v-model="form.sortOrder" @change="onSortOrderChange">
            <el-radio-button
              v-for="option in currentPositionOptions"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
          <div class="text-xs text-blue-500 mt-1">
            当前选择要求比例：{{ getRequiredRatioLabel(form.sortOrder) }}
            <span v-if="form.type === 'image' && form.imageUrl && !imageRatioError && !imageRatioValid" class="text-gray-400">
              （请上传图片后自动校验）
            </span>
          </div>
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
import { Plus } from '@element-plus/icons-vue'

// ============================================================
// 位置配置
// ============================================================
// 图片广告位置（4个）
const imagePositionMap = {
  0: { name: '顶部横幅 (5:1)', type: 'primary', ratio: '5:1', ratioValue: 5 },
  1: { name: '网格1 (4:3)', type: 'success', ratio: '4:3', ratioValue: 4/3 },
  2: { name: '网格2 (4:3)', type: 'warning', ratio: '4:3', ratioValue: 4/3 },
  3: { name: '网格3 (4:3)', type: 'info', ratio: '4:3', ratioValue: 4/3 },
}

// 文字广告位置（10个）
const textPositionMap = {}
for (let i = 1; i <= 10; i++) {
  textPositionMap[i] = { name: `文字广告位${i}`, type: 'info' }
}

// ============================================================
// 比例校验工具函数
// ============================================================
// 获取位置要求的比例标签
const getRequiredRatioLabel = (sortOrder) => {
  if (sortOrder === 0) return '5:1'
  return '4:3'
}

// 获取位置要求的比例数值
const getRequiredRatioValue = (sortOrder) => {
  if (sortOrder === 0) return 5
  return 4 / 3
}

// 校验图片比例是否匹配要求
const validateImageRatio = (width, height, sortOrder) => {
  if (!width || !height) return { valid: false, message: '无法读取图片尺寸' }
  const ratio = width / height
  const required = getRequiredRatioValue(sortOrder)
  const tolerance = 0.08 // 允许 8% 误差
  if (Math.abs(ratio - required) / required > tolerance) {
    const requiredLabel = getRequiredRatioLabel(sortOrder)
    return {
      valid: false,
      message: `图片比例为 ${width}:${height}（约 ${ratio.toFixed(2)}），要求 ${requiredLabel}（约 ${required.toFixed(2)}），请裁剪后重新上传`
    }
  }
  return { valid: true, message: '' }
}

// 校验行数据（表格中使用）
const isValidRatio = (row) => {
  if (row.type !== 'image' || !row.imageWidth || !row.imageHeight) return false
  const result = validateImageRatio(row.imageWidth, row.imageHeight, row.sortOrder)
  return result.valid
}

// 获取位置名称
const getPositionName = (row) => {
  if (row.type === 'image') {
    return imagePositionMap[row.sortOrder]?.name || `其他(${row.sortOrder})`
  } else {
    return textPositionMap[row.sortOrder]?.name || `其他(${row.sortOrder})`
  }
}

// 获取位置标签类型
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
const formRef = ref(null)
const uploadRef = ref(null)

// 图片校验状态
const imageRatioError = ref('')
const imageRatioValid = ref(false)

const form = reactive({
  id: null,
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  status: true,
  type: 'image',
  imageWidth: 0,
  imageHeight: 0,
})

// 根据当前类型动态生成位置选项
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

// ============================================================
// 图片处理
// ============================================================
// 从 File 对象读取图片尺寸
const readImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => reject(new Error('无法解码图片'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

// 校验并更新图片状态
const validateAndUpdateImage = async (imageUrl) => {
  if (!imageUrl) {
    imageRatioError.value = ''
    imageRatioValid.value = false
    form.imageWidth = 0
    form.imageHeight = 0
    return
  }

  // 如果是 data URL，直接读取
  if (imageUrl.startsWith('data:image')) {
    const img = new Image()
    img.onload = () => {
      form.imageWidth = img.naturalWidth
      form.imageHeight = img.naturalHeight
      const result = validateImageRatio(form.imageWidth, form.imageHeight, form.sortOrder)
      if (!result.valid) {
        imageRatioError.value = result.message
        imageRatioValid.value = false
      } else {
        imageRatioError.value = ''
        imageRatioValid.value = true
      }
    }
    img.onerror = () => {
      imageRatioError.value = '无法读取图片'
      imageRatioValid.value = false
    }
    img.src = imageUrl
    return
  }

  // 如果是远程 URL，通过 fetch 获取 Blob 再读取
  try {
    const response = await fetch(imageUrl, { mode: 'cors' })
    if (!response.ok) throw new Error('网络请求失败')
    const blob = await response.blob()
    if (!blob.type.startsWith('image/')) {
      imageRatioError.value = '不是有效的图片格式'
      imageRatioValid.value = false
      return
    }
    const img = new Image()
    img.onload = () => {
      form.imageWidth = img.naturalWidth
      form.imageHeight = img.naturalHeight
      const result = validateImageRatio(form.imageWidth, form.imageHeight, form.sortOrder)
      if (!result.valid) {
        imageRatioError.value = result.message
        imageRatioValid.value = false
      } else {
        imageRatioError.value = ''
        imageRatioValid.value = true
      }
    }
    img.onerror = () => {
      imageRatioError.value = '无法解码图片，请检查链接是否有效'
      imageRatioValid.value = false
    }
    img.src = URL.createObjectURL(blob)
  } catch (err) {
    imageRatioError.value = '无法获取远程图片，请检查链接是否可访问'
    imageRatioValid.value = false
  }
}

// 图片上传变化
const handleImageChange = async (file) => {
  try {
    const { width, height } = await readImageDimensions(file.raw)
    form.imageWidth = width
    form.imageHeight = height
    // 将图片转为 data URL 预览
    const reader = new FileReader()
    reader.onload = (e) => {
      form.imageUrl = e.target.result
      const result = validateImageRatio(width, height, form.sortOrder)
      if (!result.valid) {
        imageRatioError.value = result.message
        imageRatioValid.value = false
      } else {
        imageRatioError.value = ''
        imageRatioValid.value = true
        ElMessage.success('图片比例符合要求')
      }
    }
    reader.readAsDataURL(file.raw)
  } catch (err) {
    imageRatioError.value = err.message || '读取图片失败'
    imageRatioValid.value = false
  }
}

// 图片移除
const handleImageRemove = () => {
  form.imageUrl = ''
  form.imageWidth = 0
  form.imageHeight = 0
  imageRatioError.value = ''
  imageRatioValid.value = false
}

// 手动输入链接时校验
const onImageUrlInput = async (url) => {
  if (!url) {
    imageRatioError.value = ''
    imageRatioValid.value = false
    form.imageWidth = 0
    form.imageHeight = 0
    return
  }
  // 清空之前的校验状态，显示加载中
  imageRatioError.value = ''
  imageRatioValid.value = false
  await validateAndUpdateImage(url)
}

// ============================================================
// 类型/位置变化
// ============================================================
const onTypeChange = () => {
  if (form.type === 'image') {
    form.sortOrder = 0
    // 如果已有图片，重新校验比例
    if (form.imageUrl) {
      validateAndUpdateImage(form.imageUrl)
    }
  } else {
    form.sortOrder = 1
    // 文字广告清空图片相关
    form.imageUrl = ''
    form.imageWidth = 0
    form.imageHeight = 0
    imageRatioError.value = ''
    imageRatioValid.value = false
  }
}

const onSortOrderChange = () => {
  // 位置变化时重新校验图片比例
  if (form.type === 'image' && form.imageUrl) {
    validateAndUpdateImage(form.imageUrl)
  }
}

// ============================================================
// CRUD 操作
// ============================================================
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
  const defaultSortOrder = 0
  Object.assign(form, {
    id: null,
    title: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: defaultSortOrder,
    status: true,
    type: 'image',
    imageWidth: 0,
    imageHeight: 0,
  })
  imageRatioError.value = ''
  imageRatioValid.value = false
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑广告'
  Object.assign(form, {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl || '',
    linkUrl: row.linkUrl || '',
    sortOrder: row.sortOrder,
    status: row.status,
    type: row.type || 'image',
    imageWidth: row.imageWidth || 0,
    imageHeight: row.imageHeight || 0,
  })
  imageRatioError.value = ''
  imageRatioValid.value = false

  // 如果有图片宽高，校验比例
  if (form.type === 'image' && form.imageUrl && form.imageWidth && form.imageHeight) {
    const result = validateImageRatio(form.imageWidth, form.imageHeight, form.sortOrder)
    if (!result.valid) {
      imageRatioError.value = result.message
      imageRatioValid.value = false
    } else {
      imageRatioError.value = ''
      imageRatioValid.value = true
    }
  } else if (form.type === 'image' && form.imageUrl) {
    // 有图片链接但没有宽高数据（旧数据），尝试远程读取
    validateAndUpdateImage(form.imageUrl)
  }

  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const submitForm = async () => {
  // 表单基础校验
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  // 图片广告必须校验图片比例
  if (form.type === 'image') {
    if (!form.imageUrl) {
      ElMessage.error('请上传广告图片')
      return
    }
    if (!form.imageWidth || !form.imageHeight) {
      ElMessage.error('无法读取图片尺寸，请重新上传')
      return
    }
    const result = validateImageRatio(form.imageWidth, form.imageHeight, form.sortOrder)
    if (!result.valid) {
      ElMessage.error(result.message)
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
    }

    if (form.type === 'image') {
      payload.imageUrl = form.imageUrl
      payload.imageWidth = form.imageWidth
      payload.imageHeight = form.imageHeight
    } else {
      payload.imageUrl = ''
      payload.imageWidth = 0
      payload.imageHeight = 0
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
    const msg = err?.data?.message || err?.message || '操作失败，请稍后重试'
    ElMessage.error(msg)
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
.ad-image-upload :deep(.el-upload--picture-card) {
  width: 120px;
  height: 90px;
}

.ad-image-upload :deep(.el-upload-list__item) {
  width: 120px;
  height: 90px;
}
</style>