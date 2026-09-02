import { defineEventHandler, readBody } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, url, logo, description, sortOrder, status, target, rel } = body

  if (!name) throw createError({ statusCode: 400, message: '网站名称不能为空' })
  if (!url) throw createError({ statusCode: 400, message: '链接地址不能为空' })
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw createError({ statusCode: 400, message: '链接地址必须以 http:// 或 https:// 开头' })
  }

  const link = await prisma.friendlyLink.create({
    data: {
      name,
      url,
      logo: logo || '',
      description: description || '',
      sortOrder: Number(sortOrder) || 0,
      status: status === undefined ? true : Boolean(status),
      target: target || '_blank',
      rel: rel || 'nofollow noopener',
    },
  })

  return { code: 200, data: link, msg: '添加成功' }
})