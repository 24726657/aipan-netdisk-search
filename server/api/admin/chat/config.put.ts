// ============================================================
// API：更新聊天功能配置状态（管理员）
// 调用方式：PUT /api/admin/chat/config
// 需要登录（管理员权限）
// ============================================================

import { defineEventHandler, readBody } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  // 简单权限验证：检查 token 是否存在
  // 实际项目建议完善 JWT 验证和角色检查
  const token = getHeader(event, 'authorization')?.split(' ')[1]
  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const body = await readBody(event)
  const { enabled } = body

  if (typeof enabled !== 'boolean') {
    throw createError({ statusCode: 400, message: 'enabled 必须为布尔值' })
  }

  await prisma.systemSettings.upsert({
    where: { key: 'chat_enabled' },
    update: { value: String(enabled) },
    create: { key: 'chat_enabled', value: String(enabled) },
  })

  return { code: 200, msg: `聊天功能已${enabled ? '启用' : '禁用'}` }
})
