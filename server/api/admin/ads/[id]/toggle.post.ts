import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const ad = await prisma.ad.findUnique({ where: { id } })
  if (!ad) throw createError({ statusCode: 404, message: '广告不存在' })
  const updated = await prisma.ad.update({
    where: { id },
    data: { status: !ad.status },
  })
  return { code: 200, data: updated }
})
