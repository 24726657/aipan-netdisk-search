import { defineEventHandler } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async () => {
  const links = await prisma.friendlyLink.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return { code: 200, data: links }
})