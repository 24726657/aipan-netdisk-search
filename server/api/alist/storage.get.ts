import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiUrl = config.alistApiUrl || process.env.ALIST_API_URL
  const token = config.alistToken || process.env.ALIST_TOKEN

  if (!apiUrl || !token) {
    return { code: 500, msg: 'Alist not configured' }
  }

  try {
    const result = await $fetch(`${apiUrl}/storage`, {
      headers: { 'Authorization': token }
    })
    return result
  } catch (err) {
    return { code: 500, msg: err.message }
  }
})
