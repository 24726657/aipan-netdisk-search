import { defineEventHandler, readBody, getRouterParam } from 'h3'
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { points, reason, type } = body

  if (points === undefined || points === null || points === 0) {
    throw createError({ statusCode: 400, message: '请输入有效的积分数量（正数为增加，负数为减少）' })
  }
  if (!reason || reason.trim().length === 0) {
    throw createError({ statusCode: 400, message: '请填写变动原因' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, points: true, username: true }
  })
  if (!user) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }

  if (points < 0 && user.points + points < 0) {
    throw createError({ statusCode: 400, message: '用户积分不足，无法扣除' })
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
    })

    const history = await tx.pointsHistory.create({
      data: {
        userId: userId,
        points: points,
        type: type || 'admin_adjust',
        description: reason.trim(),
      },
    })

    return { user: updatedUser, history }
  })

  return {
    code: 200,
    data: {
      userId: result.user.id,
      username: result.user.username,
      points: result.user.points,
      changed: points,
      historyId: result.history.id,
    },
    msg: `积分${points > 0 ? '增加' : '扣除'}成功`
  }
})
