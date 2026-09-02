// ============================================================
// 公开 API：获取所有已启用的广告（按排序升序）
// 调用方式：GET /api/ads
// 无需登录，用于首页展示
// 自动过滤：只返回在展示时间范围内的广告
// ============================================================

import { defineEventHandler } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async () => {
  const now = new Date()
  
  const ads = await prisma.ad.findMany({
    where: {
      status: true,
      AND: [
        // 开始时间：为空 或 已到开始时间
        {
          OR: [
            { startTime: null },
            { startTime: { lte: now } }
          ]
        },
        // 结束时间：为空 或 未到结束时间
        {
          OR: [
            { endTime: null },
            { endTime: { gte: now } }
          ]
        }
      ]
    },
    orderBy: { sortOrder: 'asc' },
  })
  
  return { code: 200, data: ads }
})