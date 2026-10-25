// GitHub Pages 不能配置服务端回退，复制一份 index.html 作为 404 页面。
// 刷新 /menu 这类前端路由时，Pages 返回 index，Vue Router 再用 base 找到实际路由。
import { copyFile } from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve('dist')
await copyFile(path.join(dist, 'index.html'), path.join(dist, '404.html'))
console.log('copied dist/index.html -> dist/404.html')
