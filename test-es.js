import { Client } from '@elastic/elasticsearch'
const client = new Client({ node: 'http://localhost:9200' })
try {
  const info = await client.info()
  console.log('ES 连接成功:', info)
} catch (e) {
  console.error('ES 连接失败:', e)
}
