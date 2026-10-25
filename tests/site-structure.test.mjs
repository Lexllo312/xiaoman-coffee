import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src')
const read = (relative) => readFileSync(path.join(root, relative), 'utf8')
const filesIn = (directory) => readdirSync(path.join(src, directory)).filter((file) => file.endsWith('.vue'))

const expectedViews = ['CartView.vue', 'HomeView.vue', 'MenuView.vue']
const expectedComponents = [
  'AppFooter.vue',
  'AppHeader.vue',
  'BaseButton.vue',
  'BaseInput.vue',
  'BaseModal.vue',
  'CartLine.vue',
  'OrderSummary.vue',
  'ProductCard.vue',
  'ProductImage.vue',
  'SearchBar.vue',
  'ToastStack.vue'
]

test('整站只有 3 个页面和 15 个单文件组件', () => {
  assert.deepEqual(filesIn('views').sort(), expectedViews)
  assert.deepEqual(filesIn('components').sort(), expectedComponents)
  assert.equal(1 + filesIn('views').length + filesIn('components').length, 15)
  // 根组件之外的 SFC 不许散落在 src 根目录，否则计数会失真
  assert.deepEqual(readdirSync(src).filter((file) => file.endsWith('.vue')), ['App.vue'])
})

test('商品素材下载到本地 public/images，不依赖外链', () => {
  const source = read('src/data/products.js')
  const images = [...source.matchAll(/image:\s*'([^']+)'/g)].map((match) => match[1])
  assert.ok(images.length >= 6, '至少六件商品有图片')
  for (const image of images) {
    assert.ok(image.startsWith('/images/'), `${image} 应是本地路径`)
    assert.ok(existsSync(path.join(root, 'public', image)), `${image} 文件不存在`)
  }
})

test('路由只渲染三个页面组件', () => {
  const router = read('src/router/index.js')
  for (const view of expectedViews) assert.match(router, new RegExp(view.replace('.vue', '')))
  assert.doesNotMatch(router, /AboutView|ProductView|NotFoundView/)
})

test('教程知识点都能在指定文件里找到真实落点', () => {
  const checks = [
    { name: '创建应用', file: 'src/main.js', pattern: /createApp\(App\)/ },
    { name: '声明式渲染', file: 'src/views/HomeView.vue', pattern: /\{\{ dose \}\}[\s\S]*\{\{ water \}\}/ },
    { name: 'Attribute 绑定', file: 'src/components/ProductImage.vue', pattern: /:src=/ },
    { name: '事件监听', file: 'src/components/ProductCard.vue', pattern: /@click="emit\('add'/ },
    { name: '表单绑定', file: 'src/views/HomeView.vue', pattern: /v-model\.number="dose"/ },
    { name: '条件渲染', file: 'src/components/ProductCard.vue', pattern: /v-if="product\.featured"/ },
    { name: '列表渲染', file: 'src/views/MenuView.vue', pattern: /v-for="product in filteredProducts"[\s\S]*?:key="product\.id"/ },
    { name: '计算属性', file: 'src/views/MenuView.vue', pattern: /const filteredProducts = computed\(/ },
    { name: '生命周期', file: 'src/views/MenuView.vue', pattern: /onMounted\(\(\) => \{/ },
    { name: '模板引用', file: 'src/views/MenuView.vue', pattern: /ref="searchRef"/ },
    { name: '侦听器', file: 'src/stores/cart.js', pattern: /watch\(lines,/ },
    { name: '组件', file: 'src/App.vue', pattern: /<RouterView/ },
    { name: 'Props', file: 'src/components/ProductCard.vue', pattern: /defineProps\(\{ product:/ },
    { name: 'Emits', file: 'src/components/ProductCard.vue', pattern: /defineEmits\(\['detail', 'add'\]\)/ },
    { name: '插槽', file: 'src/components/BaseModal.vue', pattern: /<slot name="footer" \/>/ }
  ]

  for (const check of checks) {
    assert.match(read(check.file), check.pattern, `${check.name} 不在 ${check.file} 里`)
  }
})
