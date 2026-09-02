import { defineEventHandler, readBody, getRouterParam } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { title, imageUrl, linkUrl, sortOrder, status, type, startTime, endTime, imageWidth, imageHeight } = body

  // 检查同一类型 + 同一位置是否已有其他启用广告（排除自身）
  const existing = await prisma.ad.findFirst({
    where: {
      type: type || 'image',
      sortOrder: Number(sortOrder),
      status: true,
      id: { not: id },
    },
  })

  if (existing) {
    return {
      code: 400,
      msg: `该位置（${type === 'text' ? '文字' : '图片'}广告位 ${sortOrder}）已有启用广告，请先下架或删除后再操作`,
    }
  }

  const ad = await prisma.ad.update({
    where: { id },
    data: {
      title,
      imageUrl: type === 'image' ? imageUrl : '',
      linkUrl: linkUrl || '',
      sortOrder: Number(sortOrder),
      status: status === undefined ? true : Boolean(status),
      type: type || 'image',
      imageWidth: imageWidth || 0,
      imageHeight: imageHeight || 0,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
    },
  })
  return { code: 200, data: ad, msg: '更新成功' }
})