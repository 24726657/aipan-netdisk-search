import { defineEventHandler, readBody } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, imageUrl, linkUrl, sortOrder, status } = body
  const ad = await prisma.ad.create({
    data: {
      title,
      imageUrl,
      linkUrl,
      sortOrder: Number(sortOrder) || 0,
      status: status === undefined ? true : Boolean(status),
    },
  })
  return { code: 200, data: ad }
})
