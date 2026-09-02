import { defineEventHandler, readBody, getRouterParam } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const status = body.status === undefined ? false : Boolean(body.status)

  const link = await prisma.friendlyLink.update({
    where: { id },
    data: { status },
  })

  return { code: 200, data: link, msg: status ? '已上架' : '已下架' }
})
