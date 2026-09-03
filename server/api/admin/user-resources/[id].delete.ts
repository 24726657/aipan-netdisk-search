import { verifyToken } from '~/server/model/user';
import prisma from "~/lib/prisma";
import { removePublishedUserResource } from "~/server/services/search/elasticsearchClient.js";

export default defineEventHandler(async (event) => {
    // 1. 验证管理员权限
    const token = getHeader(event, 'authorization')?.split(' ')[1];
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '无权限访问'
        });
    }

    // 2. 获取资源 ID
    const id = parseInt(event.context.params?.id || '');
    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: '无效的资源 ID'
        });
    }

    // 3. 检查资源是否存在
    const existingResource = await prisma.userResource.findUnique({
        where: { id },
    });

    if (!existingResource) {
        throw createError({
            statusCode: 404,
            message: '资源不存在'
        });
    }

    // 4. 删除数据库记录
    await prisma.userResource.delete({
        where: { id },
    });

    // 5. 从 Elasticsearch 中删除（如果已发布）
    if (existingResource.status === 'published') {
        try {
            await removePublishedUserResource(id);
        } catch (esError) {
            console.error(`从 ES 删除资源 ${id} 失败，但数据库已删除:`, esError);
        }
    }

    return {
        success: true,
        message: '资源删除成功'
    };
});