import { defineEventHandler, getQuery } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const reviewStatus = query.reviewStatus as string || undefined
  const where: any = {}

  if (reviewStatus) {
    where.reviewStatus = reviewStatus
  }

  const links = await prisma.friendlyLink.findMany({
    where,
    orderBy: [
      { reviewStatus: 'asc' }, // pending 排在最前面
      { sortOrder: 'asc' }
    ]
  })
  return { code: 200, data: links }
})