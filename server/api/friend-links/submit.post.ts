import { defineEventHandler, readBody } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, url, logo, description, submitterName, submitterEmail, submitterRemark } = body

  if (!name || name.trim().length === 0) {
    throw createError({ statusCode: 400, message: '请输入网站名称' })
  }
  if (!url || url.trim().length === 0) {
    throw createError({ statusCode: 400, message: '请输入链接地址' })
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw createError({ statusCode: 400, message: '链接地址必须以 http:// 或 https:// 开头' })
  }
  if (name.trim().length > 100) {
    throw createError({ statusCode: 400, message: '网站名称不能超过100个字符' })
  }

  const existing = await prisma.friendlyLink.findFirst({
    where: {
      url: url.trim(),
      reviewStatus: { in: ['pending', 'approved'] }
    }
  })
  if (existing) {
    throw createError({ statusCode: 400, message: '该链接已提交或已收录，请勿重复提交' })
  }

  const link = await prisma.friendlyLink.create({
    data: {
      name: name.trim(),
      url: url.trim(),
      logo: logo?.trim() || '',
      description: description?.trim() || '',
      sortOrder: 999,
      status: false,
      reviewStatus: 'pending',
      submitterName: submitterName?.trim() || '',
      submitterEmail: submitterEmail?.trim() || '',
      submitterRemark: submitterRemark?.trim() || '',
    }
  })

  return {
    code: 200,
    data: { id: link.id, name: link.name, url: link.url },
    msg: '提交成功，请等待管理员审核'
  }
})
