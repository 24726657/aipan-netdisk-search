<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">提交友情链接</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">提交后需等待管理员审核，审核通过后会在首页展示</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
          <el-form-item label="网站名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入网站名称" maxlength="100" />
          </el-form-item>

          <el-form-item label="链接地址" prop="url">
            <el-input v-model="form.url" placeholder="https://example.com" />
            <div class="text-xs text-gray-400 mt-1">请确保链接有效，且符合收录标准</div>
          </el-form-item>

          <el-form-item label="Logo 地址">
            <el-input v-model="form.logo" placeholder="https://example.com/logo.png（可选）" />
          </el-form-item>

          <el-form-item label="网站描述">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请简单描述您的网站（可选）" maxlength="200" />
          </el-form-item>

          <el-divider>联系方式（用于审核通知）</el-divider>

          <el-form-item label="联系人">
            <el-input v-model="form.submitterName" placeholder="您的姓名或昵称（可选）" />
          </el-form-item>

          <el-form-item label="联系邮箱" prop="submitterEmail">
            <el-input v-model="form.submitterEmail" placeholder="your@email.com" />
            <div class="text-xs text-gray-400 mt-1">审核结果将发送到此邮箱</div>
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="form.submitterRemark" type="textarea" :rows="2" placeholder="如有特殊说明请填写（可选）" />
          </el-form-item>

          <el-form-item>
            <div class="flex gap-4">
              <el-button type="primary" size="large" :loading="submitting" @click="submitForm">
                提交申请
              </el-button>
              <el-button size="large" @click="navigateTo('/')">返回首页</el-button>
            </div>
          </el-form-item>
        </el-form>

        <div v-if="submitSuccess" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
            <i class="fas fa-check-circle text-xl"></i>
            <span class="font-medium">提交成功！</span>
          </div>
          <p class="text-sm text-green-600 dark:text-green-400 mt-1">
            您的申请已提交，管理员审核通过后会邮件通知您，请耐心等待。
          </p>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          已提交过？<a href="#" class="text-blue-600 hover:underline" @click.prevent="openQueryDialog">查询审核状态</a>
        </p>
      </div>

      <el-dialog v-model="queryDialogVisible" title="查询审核状态" width="450px">
        <el-input v-model="queryEmail" placeholder="请输入提交时填写的邮箱" />
        <el-button class="mt-3" type="primary" @click="queryStatus">查询</el-button>
        <div v-if="queryResult.length > 0" class="mt-4">
          <div v-for="item in queryResult" :key="item.id" class="py-2 border-b border-gray-100 dark:border-gray-700">
            <div class="font-medium">{{ item.name }}</div>
            <div class="text-sm text-gray-500">
              状态：
              <el-tag :type="getStatusType(item.reviewStatus)" size="small">
                {{ getStatusText(item.reviewStatus) }}
              </el-tag>
            </div>
            <div v-if="item.reviewStatus === 'rejected' && item.rejectReason" class="text-sm text-red-500">
              拒绝原因：{{ item.rejectReason }}
            </div>
          </div>
        </div>
        <div v-else-if="queried" class="mt-4 text-gray-500">暂无提交记录</div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

definePageMeta({ layout: false })

const formRef = ref(null)
const submitting = ref(false)
const submitSuccess = ref(false)

const form = reactive({
  name: '',
  url: '',
  logo: '',
  description: '',
  submitterName: '',
  submitterEmail: '',
  submitterRemark: '',
})

const rules = {
  name: [
    { required: true, message: '请输入网站名称', trigger: 'blur' },
    { max: 100, message: '名称不能超过100个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
          callback(new Error('链接地址必须以 http:// 或 https:// 开头'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  submitterEmail: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch { return }

  submitting.value = true
  try {
    const res = await $fetch('/api/friend-links/submit', {
      method: 'POST',
      body: form
    })
    ElMessage.success(res.msg || '提交成功')
    submitSuccess.value = true
    formRef.value.resetFields()
  } catch (err) {
    ElMessage.error(err.data?.message || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const queryDialogVisible = ref(false)
const queryEmail = ref('')
const queryResult = ref([])
const queried = ref(false)

const openQueryDialog = () => {
  queryEmail.value = ''
  queryResult.value = []
  queried.value = false
  queryDialogVisible.value = true
}

const queryStatus = async () => {
  if (!queryEmail.value || !queryEmail.value.includes('@')) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }
  try {
    const res = await $fetch(`/api/friend-links/status?email=${encodeURIComponent(queryEmail.value)}`)
    queryResult.value = res.data || []
    queried.value = true
    if (queryResult.value.length === 0) {
      ElMessage.info('未找到提交记录')
    }
  } catch (err) {
    ElMessage.error('查询失败，请稍后重试')
  }
}

const getStatusText = (status) => {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}
</script>
