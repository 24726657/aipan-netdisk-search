// ============================================================
// 公开 API：获取所有已启用的广告（按排序升序）
// 调用方式：GET /api/ads
// 无需登录，用于首页展示
// ============================================================

import { defineEventHandler } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async () => {
  const ads = await prisma.ad.findMany({
    where: { status: true },
    orderBy: { sortOrder: 'asc' },
  })
  return { code: 200, data: ads }
})
