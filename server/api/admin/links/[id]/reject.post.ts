import { defineEventHandler, readBody, getRouterParam } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { reason } = body

  const link = await prisma.friendlyLink.update({
    where: { id },
    data: {
      reviewStatus: 'rejected',
      status: false,
      reviewedAt: new Date(),
      rejectReason: reason || '不符合收录标准',
    }
  })

  return { code: 200, data: link, msg: '已拒绝' }
})
