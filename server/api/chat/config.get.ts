// ============================================================
// API：获取聊天功能配置状态
// 调用方式：GET /api/chat/config
// 无需登录，用于前台判断是否显示聊天入口
// ============================================================

import { defineEventHandler } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async () => {
  const setting = await prisma.systemSettings.findUnique({
    where: { key: 'chat_enabled' },
  })

  // 默认启用，如果没有配置则返回 true
  const enabled = setting?.value !== 'false'

  return { code: 200, data: { enabled } }
})
