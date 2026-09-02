// ============================================================
// 公开 API：获取所有已启用的友情链接（按排序升序）
// 调用方式：GET /api/links
// 无需登录，用于页脚展示
// ============================================================

import { defineEventHandler } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async () => {
  const links = await prisma.friendlyLink.findMany({
    where: {
      status: true,
      reviewStatus: 'approved',
    },
    orderBy: { sortOrder: 'asc' },
  })
  return { code: 200, data: links }
})