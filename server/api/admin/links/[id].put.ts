import { defineEventHandler, readBody, getRouterParam } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { name, url, description, sortOrder, status, target } = body

  if (!name) throw createError({ statusCode: 400, message: '网站名称不能为空' })
  if (!url) throw createError({ statusCode: 400, message: '链接地址不能为空' })

  const link = await prisma.friendlyLink.update({
    where: { id },
    data: {
      name,
      url,
      description: description || '',
      sortOrder: Number(sortOrder) || 0,
      status: status === undefined ? true : Boolean(status),
      target: target || '_blank',
    },
  })

  return { code: 200, data: link, msg: '更新成功' }
})
