import { defineEventHandler, readBody, getRouterParam } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { title, imageUrl, linkUrl, sortOrder, status } = body
  const ad = await prisma.ad.update({
    where: { id },
    data: {
      title,
      imageUrl,
      linkUrl,
      sortOrder: Number(sortOrder),
      status: Boolean(status),
    },
  })
  return { code: 200, data: ad }
})
