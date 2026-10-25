/**
 * 用 CDP 驱动 headless Chrome 给每个页面截全页图。
 * 不为项目引入 puppeteer，直接用 Node 24 内置的 WebSocket。
 *
 * 用法：node scripts/shoot.mjs [baseUrl] [outDir]
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const OUT = process.argv[3] ?? path.resolve('docs/screenshots')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9333
const PROFILE = path.resolve('.chrome-shot-profile')

const pages = [
  { name: '01-home', path: '/', height: 900 },
  { name: '02-menu', path: '/menu', height: 900 },
  {
    name: '03-cart',
    path: '/cart',
    height: 900,
    seedCart: `localStorage.setItem('xiaoman-cart-v1', JSON.stringify([
      { id: 'yirga-cheffe', qty: 2 },
      { id: 'blend-morning', qty: 1 }
    ])); location.reload();`
  },
  { name: '04-mobile-home', path: '/', width: 390, height: 844 },
  { name: '05-mobile-menu', path: '/menu', width: 390, height: 844 }
]

/** 最小 CDP 客户端 */
function connect(url) {
  const ws = new WebSocket(url)
  const pending = new Map()
  let seq = 0

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    }
  })

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  return {
    ready,
    send(method, params = {}) {
      const id = ++seq
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify({ id, method, params }))
      })
    },
    close: () => ws.close()
  }
}

async function main() {
  await rm(PROFILE, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      'about:blank'
    ],
    { stdio: 'ignore' }
  )

  // 等调试端口起来
  let targetUrl = null
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await res.json()
      const page = list.find((item) => item.type === 'page')
      if (page) {
        targetUrl = page.webSocketDebuggerUrl
        break
      }
    } catch {
      /* 还没起 */
    }
    await sleep(250)
  }
  if (!targetUrl) throw new Error('Chrome 调试端口没起来')

  const client = connect(targetUrl)
  await client.ready
  await client.send('Page.enable')
  await client.send('Runtime.enable')

  for (const page of pages) {
    const width = page.width ?? 1440
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: page.height,
      deviceScaleFactor: 1,
      mobile: width < 600
    })

    await client.send('Page.navigate', { url: BASE + page.path })
    await sleep(1400)

    // 预置购物车数据，让购物车页有真实内容
    if (page.seedCart) {
      await client.send('Runtime.evaluate', { expression: page.seedCart })
      await sleep(1600)
    }

    // 滚动一遍整页：触发 v-reveal 与数字滚动条里的 IntersectionObserver，
    // 否则全页截图会拍到还没显现的区块
    await client.send('Runtime.evaluate', {
      expression: `(async () => {
        const step = window.innerHeight * 0.75;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 110));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 1200));
        return document.body.scrollHeight;
      })()`,
      awaitPromise: true
    })

    // 兜底：把仍处于隐藏态的 reveal 元素强制显示
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const style = document.createElement('style');
        style.textContent = '.reveal{opacity:1!important;transform:none!important}';
        document.head.appendChild(style);
        return document.title;
      })()`
    })
    await sleep(350)

    const metrics = await client.send('Page.getLayoutMetrics')
    const fullHeight = Math.ceil(metrics.cssContentSize.height)

    const shot = await client.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width,
        height: Math.min(fullHeight, 6000),
        scale: 1
      }
    })

    const file = path.join(OUT, `${page.name}.png`)
    await writeFile(file, Buffer.from(shot.data, 'base64'))
    console.log(`ok ${page.name} ${width}x${fullHeight} -> ${file}`)
  }

  client.close()
  chrome.kill()
  await sleep(400)
  await rm(PROFILE, { recursive: true, force: true }).catch(() => {})
}

main().catch((err) => {
  console.error('截图失败:', err.message)
  process.exit(1)
})
