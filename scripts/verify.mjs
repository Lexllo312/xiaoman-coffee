/**
 * 端到端验证：3 个路由 + 搜索、详情弹窗、加购、数量、表单校验、下单、持久化。
 * 通过 CDP 驱动 headless Chrome，不引第三方依赖。
 *
 * 用法：node scripts/verify.mjs [baseUrl]
 */
import { spawn } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9334
const PROFILE = path.resolve('.chrome-verify-profile')

function connect(url) {
  const ws = new WebSocket(url)
  const pending = new Map()
  const events = []
  let seq = 0

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      message.error ? reject(new Error(message.error.message)) : resolve(message.result)
    } else if (message.method) {
      events.push(message)
    }
  })

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  return {
    ready,
    events,
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
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    'about:blank'
  ], { stdio: 'ignore' })

  let wsUrl = null
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((item) => item.type === 'page')
      if (page) {
        wsUrl = page.webSocketDebuggerUrl
        break
      }
    } catch {
      // 调试端口还没就绪
    }
    await sleep(250)
  }
  if (!wsUrl) throw new Error('Chrome 调试端口未就绪')

  const client = connect(wsUrl)
  await client.ready
  await client.send('Page.enable')
  await client.send('Runtime.enable')

  const failures = []
  const jsErrors = []

  async function evaluate(expression) {
    const { result, exceptionDetails } = await client.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    })
    if (exceptionDetails) {
      throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
    }
    return result.value
  }

  async function navigate(route) {
    const loaded = new Promise((resolve) => {
      const check = setInterval(() => {
        if (client.events.some((event) => event.method === 'Page.loadEventFired')) {
          clearInterval(check)
          resolve()
        }
      }, 80)
      setTimeout(() => {
        clearInterval(check)
        resolve()
      }, 5000)
    })
    await client.send('Page.navigate', { url: BASE + route })
    await loaded
    await sleep(900)
  }

  async function step(name, expression, verify) {
    client.events.length = 0
    try {
      const value = await evaluate(expression)
      const problem = verify(value)
      if (problem) failures.push(`${name}：${problem}`)
      else console.log(`PASS  ${name}`)
    } catch (error) {
      failures.push(`${name}：执行失败 ${error.message}`)
    }
    for (const event of client.events) {
      if (event.method === 'Runtime.exceptionThrown') {
        jsErrors.push(event.params?.exceptionDetails?.exception?.description ?? 'unknown')
      }
    }
  }

  // 清空上一次运行留下的浏览器存储
  await navigate('/')
  await evaluate('localStorage.clear(); location.reload(); true')
  await sleep(900)

  await navigate('/')
  await step('首页标题与图片加载', `JSON.stringify({
    title: document.title,
    heading: document.querySelector('h1')?.textContent.trim(),
    imageWidth: document.querySelector('.hero > img')?.naturalWidth || 0
  })`, (value) => {
    const data = JSON.parse(value)
    if (!data.title.includes('城市里的一杯慢')) return '标题不含品牌副标题'
    if (!data.heading?.includes('城市里')) return '主标题未渲染'
    if (!data.imageWidth) return '首页图片未加载'
    return ''
  })

  await step('首页主按钮文字可见', `(() => {
    const button = document.querySelector('.actions .button')
    const style = getComputedStyle(button)
    return JSON.stringify({
      text: button.textContent.trim(),
      color: style.color,
      background: style.backgroundColor
    })
  })()`, (value) => {
    const data = JSON.parse(value)
    if (data.text !== '去选咖啡') return `按钮文字不对：${data.text || '空'}`
    if (data.color === data.background) return '按钮文字颜色与背景相同，不可见'
    return ''
  })

  await step('首页商品卡图片可进入菜单', `(async () => {
    document.querySelector('.grid .photo').click()
    await new Promise((resolve) => setTimeout(resolve, 350))
    return location.pathname
  })()`, (value) => value === '/menu' ? '' : `点击后停在 ${value}`)

  await navigate('/menu')
  await step('菜单页聚焦搜索框并渲染 6 件商品', `JSON.stringify({
    active: document.activeElement?.id,
    cards: document.querySelectorAll('.card').length
  })`, (value) => {
    const data = JSON.parse(value)
    if (data.active !== 'product-search') return '模板引用未聚焦搜索框'
    if (data.cards !== 6) return `应有 6 件商品，实际 ${data.cards}`
    return ''
  })

  await step('搜索“耶加”只留下 1 件', `(async () => {
    const input = document.querySelector('#product-search')
    input.value = '耶加'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 150))
    return JSON.stringify({
      cards: document.querySelectorAll('.card').length,
      text: document.body.innerText
    })
  })()`, (value) => {
    const data = JSON.parse(value)
    if (data.cards !== 1) return `搜索后应为 1 件，实际 ${data.cards}`
    if (!data.text.includes('耶加雪菲')) return '结果文本不对'
    return ''
  })

  await step('清空搜索后切换“拼配”分类得到 2 件', `(async () => {
    [...document.querySelectorAll('.search button')].find((item) => item.textContent.includes('清空')).click()
    await new Promise((resolve) => setTimeout(resolve, 120))
    const button = [...document.querySelectorAll('.categories button')].find((item) => item.textContent.trim() === '拼配')
    button.click()
    await new Promise((resolve) => setTimeout(resolve, 150))
    return document.querySelectorAll('.card').length
  })()`, (value) => value === 2 ? '' : `拼配分类应有 2 件，实际 ${value}`)

  await step('打开详情弹窗并显示插槽内容', `(async () => {
    document.querySelector('.categories button').click()
    await new Promise((resolve) => setTimeout(resolve, 150))
    document.querySelector('.photo').click()
    await new Promise((resolve) => setTimeout(resolve, 200))
    return JSON.stringify({
      open: !!document.querySelector('.modal'),
      text: document.querySelector('.modal')?.innerText || ''
    })
  })()`, (value) => {
    const data = JSON.parse(value)
    if (!data.open) return '详情弹窗未打开'
    if (!data.text.includes('加入购物车')) return 'footer 插槽未渲染'
    return ''
  })

  await step('弹窗关闭按钮获得焦点并支持 ESC', `(async () => {
    const focus = document.activeElement?.getAttribute('aria-label')
    const lock = getComputedStyle(document.body).overflow
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await new Promise((resolve) => setTimeout(resolve, 120))
    return JSON.stringify({ focus, lock, open: !!document.querySelector('.modal') })
  })()`, (value) => {
    const data = JSON.parse(value)
    if (data.focus !== '关闭') return '焦点没有进入弹窗'
    if (data.lock !== 'hidden') return '弹窗没有锁住背景滚动'
    if (data.open) return 'ESC 没有关闭弹窗'
    return ''
  })

  await step('弹窗中加购后页头数量为 1', `(async () => {
    document.querySelector('.photo').click()
    await new Promise((resolve) => setTimeout(resolve, 150))
    document.querySelector('.modal .add').click()
    await new Promise((resolve) => setTimeout(resolve, 200))
    return JSON.stringify({
      badge: document.querySelector('nav a[href="/cart"] span')?.textContent || '',
      stored: JSON.parse(localStorage.getItem('xiaoman-cart-v1') || '[]').length
    })
  })()`, (value) => {
    const data = JSON.parse(value)
    if (data.badge !== '1') return `购物车数量应为 1，实际 ${data.badge || '无'}`
    if (data.stored !== 1) return '没有写入 localStorage'
    return ''
  })

  await navigate('/cart')
  await step('购物车页渲染 1 行、合计正确', `JSON.stringify({
    lines: document.querySelectorAll('.line').length,
    text: document.body.innerText
  })`, (value) => {
    const data = JSON.parse(value)
    if (data.lines !== 1) return `购物车应有 1 行，实际 ${data.lines}`
    if (!data.text.includes('订单摘要')) return '缺少订单摘要组件'
    return ''
  })

  await step('数量加一后金额重算', `(async () => {
    const buttons = document.querySelectorAll('.quantity button')
    buttons[1].click()
    await new Promise((resolve) => setTimeout(resolve, 200))
    const text = document.body.innerText
    const item = JSON.parse(localStorage.getItem('xiaoman-cart-v1') || '[]')[0]
    return JSON.stringify({ qty: item?.qty, text })
  })()`, (value) => {
    const data = JSON.parse(value)
    if (data.qty !== 2) return `数量应为 2，实际 ${data.qty}`
    if (!data.text.includes('商品小计（2 件）')) return '小计没有随数量更新'
    return ''
  })

  await step('空表单提交显示 3 条错误', `(async () => {
    document.querySelector('.submit').click()
    await new Promise((resolve) => setTimeout(resolve, 150))
    return document.querySelectorAll('.error').length
  })()`, (value) => value === 3 ? '' : `应有 3 条校验错误，实际 ${value}`)

  await step('修改表单后错误提示消失', `(async () => {
    const inputs = [...document.querySelectorAll('.form input')]
    const values = ['林小满', '13800138000', '昆明市五华区学府路 12 号']
    inputs.forEach((input, index) => {
      input.value = values[index]
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await new Promise((resolve) => setTimeout(resolve, 150))
    return document.querySelectorAll('.error').length
  })()`, (value) => value === 0 ? '' : `修改后仍有 ${value} 条错误`)

  await step('填写表单后下单成功并清空购物车', `(async () => {
    document.querySelector('.submit').click()
    await new Promise((resolve) => setTimeout(resolve, 250))
    return JSON.stringify({
      success: document.body.innerText.includes('下单成功'),
      lines: document.querySelectorAll('.line').length,
      stored: JSON.parse(localStorage.getItem('xiaoman-cart-v1') || '[]').length
    })
  })()`, (value) => {
    const data = JSON.parse(value)
    if (!data.success) return '没有打开下单成功弹窗'
    if (data.lines !== 0) return '下单后购物车未清空'
    if (data.stored !== 0) return 'localStorage 未清空'
    return ''
  })

  await navigate('/menu')
  await evaluate(`localStorage.setItem('xiaoman-cart-v1', JSON.stringify([
    { id: 'yirga-cheffe', qty: 8 }
  ])); true`)
  await navigate('/menu')
  await step('库存到顶时提示上限而不是加购成功', `(async () => {
    const input = document.querySelector('#product-search')
    input.value = '耶加'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 150))
    document.querySelector('.card .bottom button').click()
    await new Promise((resolve) => setTimeout(resolve, 220))
    return JSON.stringify({
      toast: document.querySelector('.toasts')?.innerText || '',
      badge: document.querySelector('nav a[href="/cart"] span')?.textContent || ''
    })
  })()`, (value) => {
    const data = JSON.parse(value)
    if (!data.toast.includes('库存上限')) return '没有提示库存上限'
    if (data.badge !== '8') return `库存已满时数量不应增加，实际 ${data.badge}`
    return ''
  })

  await navigate('/menu')
  await evaluate(`localStorage.setItem('xiaoman-cart-v1', '[null]'); true`)
  await navigate('/cart')
  await step('脏购物车数据不会打崩页面', `JSON.stringify({
    header: !!document.querySelector('header'),
    empty: document.body.innerText.includes('购物车还是空的'),
    lines: document.querySelectorAll('.line').length
  })`, (value) => {
    const data = JSON.parse(value)
    if (!data.header) return '页头消失'
    if (!data.empty) return '没有回退到空购物车'
    if (data.lines !== 0) return '脏数据被渲染成了商品行'
    return ''
  })

  await navigate('/')
  await evaluate(`localStorage.setItem('xiaoman-cart-v1', JSON.stringify([
    { id: 'yirga-cheffe', qty: 999 },
    { id: 'blend-morning', qty: '2' }
  ])); true`)
  await navigate('/cart')
  await step('恢复时按库存夹紧且数量转成数字', `JSON.stringify({
    qtys: [...document.querySelectorAll('.quantity span')].map((node) => node.textContent),
    badge: document.querySelector('nav a[href="/cart"] span')?.textContent || ''
  })`, (value) => {
    const data = JSON.parse(value)
    if (data.qtys[0] !== '8') return `超过库存没有夹紧：${data.qtys[0]}`
    if (data.qtys[1] !== '2') return `字符串数量没有转成数字：${data.qtys[1]}`
    if (data.badge !== '10') return `页头数量应 8+2=10，实际 ${data.badge}`
    return ''
  })

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  })
  await navigate('/menu')
  await step('390px 视口无横向溢出', `JSON.stringify({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  })`, (value) => {
    const data = JSON.parse(value)
    return data.scrollWidth <= data.innerWidth ? '' : `横向溢出 ${data.scrollWidth}px`
  })

  await navigate('/no-such-page')
  await step('未知路由回退首页', 'location.pathname', (value) => value === '/' ? '' : `实际跳到 ${value}`)

  if (jsErrors.length) failures.push(`浏览器 JS 异常 ${jsErrors.length} 条：${jsErrors.join(' | ')}`)

  client.close()
  chrome.kill()
  await sleep(300)
  await rm(PROFILE, { recursive: true, force: true }).catch(() => {})

  if (failures.length) {
    console.error(`\n${failures.length} 项未通过：`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exit(1)
  }
  console.log('\n全部检查通过')
}

main().catch((error) => {
  console.error('验证失败:', error.message)
  process.exit(1)
})
