import { defineEventHandler, getQuery } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const status = query.status === undefined ? undefined : query.status === 'true'
  const where = status !== undefined ? { status } : {}
  
  const ads = await prisma.ad.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  })
  
  return { code: 200, data: ads }
})