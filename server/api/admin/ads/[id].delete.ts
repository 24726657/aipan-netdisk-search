import { defineEventHandler, getRouterParam } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  await prisma.ad.delete({ where: { id } })
  return { code: 200, message: '删除成功' }
})
