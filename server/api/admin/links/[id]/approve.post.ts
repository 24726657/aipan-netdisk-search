import { defineEventHandler, getRouterParam } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const link = await prisma.friendlyLink.update({
    where: { id },
    data: {
      reviewStatus: 'approved',
      status: true,
      reviewedAt: new Date(),
    }
  })

  return { code: 200, data: link, msg: '审核通过，链接已上线' }
})
