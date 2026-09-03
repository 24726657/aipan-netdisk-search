import { defineEventHandler, getRouterParam, getQuery } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 20

  const where = { userId }

  const [total, histories] = await prisma.$transaction([
    prisma.pointsHistory.count({ where }),
    prisma.pointsHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    code: 200,
    data: {
      total,
      list: histories,
      page,
      pageSize,
    }
  }
})
