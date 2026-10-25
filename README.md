# 小满咖啡 · XIAOMAN COFFEE

Web 全栈开发课程作业：用 Vue 3 实现一个纯前端咖啡店网站。代码按“能讲清楚”设计，不引入 UI 框架。

公网地址：<https://lexllo312.github.io/xiaoman-coffee/>（GitHub Pages，部署后生效）

## 作业要求对照

| 要求 | 完成情况 |
| --- | --- |
| 任选主题，用 Vue 实现网站（只需前端） | 咖啡店官网 + 购物车，纯前端，无后端依赖 |
| 至少 3 个页面 | 首页、菜单、购物车，共 3 个页面 |
| 15 个 Vue 单文件组件 | 正好 15 个 `.vue`：1 个根组件 + 3 个页面 + 11 个组件 |
| 覆盖 Vue 官方教程知识点 | 教程第 1–14 步逐项有落点，见下表（逐项标了文件与行号）；第 15 步是课程总结 |
| 可以公网访问 | GitHub Pages 自动部署，地址：<https://lexllo312.github.io/xiaoman-coffee/> |

## 运行与验证

```bash
pnpm install
pnpm dev                 # 开发：http://localhost:5173
pnpm build               # 构建：dist/
pnpm preview             # 预览构建结果：http://localhost:4173（只监听 [::1]，必须用 localhost 访问）
pnpm test                # 结构测试：页面数、组件数、图片、教程落点（逐文件断言）
node scripts/verify.mjs  # 浏览器端到端 19 项：搜索、弹窗、ESC、加购、库存上限、脏数据、390px 视口、下单
```

> `verify.mjs` 需要先启动 `pnpm preview`。Chrome 不在默认路径时用
> `CHROME_PATH="D:\path\to\chrome.exe" node scripts/verify.mjs` 指定；
> 脚本会自建并在结束时清理 `.chrome-verify-profile`。

## 三个页面

| 路由 | 页面 | 主要内容 |
| --- | --- | --- |
| `/` | 首页 | 主视觉、本周推荐、粉水比计算器 |
| `/menu` | 菜单 | 6 款咖啡、关键词搜索、分类筛选、商品详情弹窗 |
| `/cart` | 购物车 | 数量增减、金额汇总、收货信息校验、下单演示 |

未知路由统一回到首页，不额外占用一个组件。

## 15 个单文件组件

| 文件 | 职责 |
| --- | --- |
| `App.vue` | 页面骨架：页头、路由出口、页脚、提示 |
| `views/HomeView.vue` | 首页 |
| `views/MenuView.vue` | 菜单、筛选、详情弹窗 |
| `views/CartView.vue` | 购物车与结算表单 |
| `components/AppHeader.vue` | 导航与购物车数量 |
| `components/AppFooter.vue` | 页脚 |
| `components/BaseButton.vue` | 站内跳转链接按钮（只封装 `RouterLink`） |
| `components/BaseInput.vue` | 自定义 `v-model` 的输入框 |
| `components/BaseModal.vue` | 带默认插槽与 `footer` 具名插槽的弹窗，支持 ESC 关闭 |
| `components/CartLine.vue` | 一行购物车商品与数量事件 |
| `components/OrderSummary.vue` | 金额摘要与插槽 |
| `components/ProductCard.vue` | 商品卡片、推荐标、加购与详情事件 |
| `components/ProductImage.vue` | 商品图：裁切、懒加载与 `alt` |
| `components/SearchBar.vue` | 搜索输入、结果数与聚焦方法 |
| `components/ToastStack.vue` | 加购提示 |

## 教程知识点落点

官方教程：<https://cn.vuejs.org/tutorial/>

| # | 教程章节 | 本项目代码 |
| --- | --- | --- |
| 1 | 开始 / 创建应用 | `src/main.js:7` `createApp(App).use(createPinia()).use(router).mount('#app')` |
| 2 | 声明式渲染 | `HomeView.vue:57,59` 的 `{{ dose }}`、`{{ water }}`；`SearchBar.vue:30` 的结果数 |
| 3 | Attribute 绑定 | `ProductImage.vue:7` 的 `:src`/`:alt`；`MenuView.vue:58` 的 `:class` 激活态；`CartLine.vue:19,21` 的 `:disabled` |
| 4 | 事件监听 | `ProductCard.vue:11,23` 的 `@click` → `emit`；`CartLine.vue:19,21` 的数量按钮 |
| 5 | 表单绑定 | `MenuView.vue:52` 的 `v-model="keyword"`；`CartView.vue:57-60` 的 `v-model="form.*"`；`HomeView.vue:58` 的 `v-model.number` |
| 6 | 条件渲染 | `ProductCard.vue:13` 推荐角标；`MenuView.vue:67`／`:76` 有／无结果；`CartView.vue:42`／`:69` 空态；`BaseModal.vue:34` 的 `v-if="open"` |
| 7 | 列表渲染 | `MenuView.vue:55` 分类、`:69` 商品；`CartView.vue:46` 购物车行；`ProductCard.vue:19` 风味标签；`ToastStack.vue:9`，均带 `:key` |
| 8 | 计算属性 | `MenuView.vue:18` 的 `filteredProducts`；`HomeView.vue:13` 的 `water`；`cart.js:36-39` 的 `count/subtotal/shipping/total` |
| 9 | 生命周期与模板引用 | `MenuView.vue:27-32`：`onMounted` 里用 `ref="searchRef"` 调 `SearchBar.vue:12` 暴露的 `focus()`；`BaseModal.vue:26` 在 `onMounted` 挂全局 ESC 监听 |
| 10 | 侦听器 | `cart.js:68` 用 `watch` 把购物车写入 `localStorage`；`CartView.vue:18` 用户改表单后清掉上一次的校验提示 |
| 11 | 组件 | `App.vue:2-4` 导入页头/页脚/提示，15 个 SFC 逐层嵌套 |
| 12 | Props | `ProductCard.vue:5` 的 `product`、`CartLine.vue:2` 的 `item`、`BaseInput.vue:3-8` 的 `label/type/error` |
| 13 | Emits | `ProductCard.vue:6` 的 `detail/add`、`CartLine.vue:4` 的 `change/remove`、`BaseInput.vue:10` 的 `update:modelValue` |
| 14 | 插槽 | `BaseModal.vue:40` 默认插槽、`:42` `footer` 具名插槽（用在 `MenuView.vue:92-94`、`CartView.vue:77-79`）；`OrderSummary.vue:15` 默认插槽 |
| 15 | 你做到了 | 见实验报告第七章总结（报告与 PDF 为独立历史版本） |

## 推荐讲解顺序

1. `src/main.js` → `App.vue`：应用怎么启动，页面怎么切换。
2. `data/products.js` → `MenuView.filteredProducts`：数据怎么变成列表。
3. `ProductCard`：props 接收数据，emits 把“查看详情 / 加购”交回父组件。
4. `BaseModal`：为什么要用插槽，`v-if` 控制显隐，ESC 与焦点怎么处理。
5. `stores/cart.js`：为什么购物车只存 `id + qty`，金额全部用 computed，读到脏数据怎么办。
6. `CartView` + `BaseInput`：`v-model` 在组件里的本质是 `modelValue + update:modelValue`。

## 三处容易被追问的设计

- **`ProductImage` 为什么单独成一个组件**：图片裁切、`loading="lazy"` 与 `alt` 只写一遍，`ProductCard` 保持“结构 + 事件”的单一职责。
- **`BaseButton` 为什么只封装链接**：全站按钮都是页面跳转，保留 `<button>` 分支就成了永不执行的代码，所以上一版已删除该分支。
- **提示为什么用 `composables/useToast.js` 而不是 props**：`App.vue` 只放一个 `ToastStack`，任何页面都能 `push`，不必逐层传递；这是唯一一处组合式函数，且只有一层。

## 目录结构

```
xiaoman-coffee/
├── public/images/            # 本地商品图片与来源记录 SOURCES.json
├── docs/                     # 需求、结构、模块清单（组件清单的唯一真相源是 modules.md）
├── scripts/verify.mjs        # 浏览器端到端验证（19 项）
├── scripts/shoot.mjs         # 页面截图到 docs/screenshots/
├── scripts/fetch-images.mjs  # 一次性下载商品图，日常不需要跑
├── src/components/           # 11 个可复用组件
├── src/views/                # 3 个页面
├── src/composables/useToast.js
├── src/data/products.js      # 6 件商品与分类
├── src/stores/cart.js        # Pinia 购物车（含脏数据校验）
├── src/router/index.js       # 3 条路由 + 未知路径重定向
└── tests/site-structure.test.mjs
```

## 图片与部署

- 商品图片来自 Unsplash 高清摄影，已下载到 `public/images/`，来源与文件大小记录在 `public/images/SOURCES.json`；不依赖运行时外链。
- Netlify：导入仓库，构建命令 `pnpm run build`，发布目录 `dist`，`netlify.toml` 已配置 SPA 回退。
- 也可以执行 `pnpm build` 后把 `dist/` 拖到 <https://app.netlify.com/drop>。

> 注：`小满咖啡-Vue实验报告.docx` 与同名 PDF 不在项目根，而在**上一级目录**
> `D:\Github\Work\`（作业模板与报告放在一起）。它们是先前按 6 页版本生成的历史交付物，
> 按最新要求**没有修改**：两份文件的修改时间（21:12）早于仓库里全部源码改动（22:06 之后）。
