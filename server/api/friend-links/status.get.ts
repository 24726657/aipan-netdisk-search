import { defineEventHandler, getQuery } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = query.email as string

  if (!email || !email.includes('@')) {
    return { code: 400, msg: '请输入有效的邮箱地址' }
  }

  const links = await prisma.friendlyLink.findMany({
    where: {
      submitterEmail: email.trim(),
      reviewStatus: { not: 'rejected' }
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      url: true,
      reviewStatus: true,
      createdAt: true,
      rejectReason: true,
    }
  })

  return {
    code: 200,
    data: links,
    msg: links.length > 0 ? '查询成功' : '未找到提交记录'
  }
})
