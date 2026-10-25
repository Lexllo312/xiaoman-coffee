/** 下载 Unsplash 高清摄影素材到 public/images，并记录来源。 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const out = path.resolve('public/images')
const assets = [
  ['baoshan-typica', 'photo-1447933601403-0c6688de566e'],
  ['guji-natural', 'photo-1495474472287-4d71bcdd2085'],
  ['huila-washed', 'photo-1442512595331-e89e73853f31'],
  ['yirga-cheffe', 'photo-1514432324607-a09d9b4aefdd'],
  ['blend-morning', 'photo-1509042239860-f550ce710b93'],
  ['blend-night', 'photo-1498804103079-a6351b050096']
]

await mkdir(out, { recursive: true })
const records = []
for (const [name, id] of assets) {
  const source = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`
  const response = await fetch(source)
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const isImage = bytes.length > 50000 && (
    bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ||
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    bytes.subarray(0, 4).toString() === 'RIFF'
  )
  if (!isImage) throw new Error(`${name}: 返回内容不是有效的大图`)
  await writeFile(path.join(out, `${name}.jpg`), bytes)
  records.push({ file: `/images/${name}.jpg`, source, bytes: bytes.length })
  console.log(`${name}.jpg ${bytes.length} bytes`)
}
await writeFile(path.join(out, 'SOURCES.json'), JSON.stringify(records, null, 2))
