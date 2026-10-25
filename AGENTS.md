# 项目约定（xiaoman-coffee）

Vue 3 纯前端咖啡店网站，课程作业。目标：3 个页面、15 个单文件组件、代码可逐文件讲解。

## 技术栈（已锁定）

- Vue 3.5（`<script setup>` 组合式 API）、Vue Router 4、Pinia 3、Vite 6、原生 CSS。
- 不引入 UI 组件库、CSS 框架、图标库，也不为少数功能新增依赖。
- 不引入自定义指令；组合式函数最多一层（目前只有 `composables/useToast.js`），不做层层封装，
  能在一屏内看懂的逻辑留在组件里。

## 命令

```bash
pnpm install
pnpm dev                       # 开发服务器 5173
pnpm build                     # 构建到 dist/
pnpm preview                   # 预览 dist（只监听 [::1]，必须用 localhost:4173 访问）
pnpm test                      # 结构测试：页数/组件数/图片/教程落点（逐文件断言）
node scripts/verify.mjs        # 浏览器端到端 19 项（先启动 preview）
node scripts/shoot.mjs         # 截图到 docs/screenshots/（默认 http://localhost:4173）
```

- Chrome 不在 `C:\Program Files\Google\Chrome\Application\chrome.exe` 时，
  用 `CHROME_PATH=<chrome 路径>` 覆盖 `verify.mjs` 的浏览器路径。
- `node scripts/shoot.mjs` 默认访问 `http://localhost:4173`；不要改成 `127.0.0.1`，
  `vite preview` 只监听 `[::1]`，用回环 IPv4 会被拒绝连接。
- `scripts/fetch-images.mjs` 是一次性下载商品图的脚本，日常流程不需要执行。

## 目录职责

- `src/views/`：3 个页面，负责取数、筛选和页面级状态。
- `src/components/`：11 个可复用组件；基础组件不读路由。
- `src/stores/cart.js`：唯一的全局状态，含 `restore()` 脏数据校验与运费常量。其余状态留在组件里的 `ref`。
- `src/composables/useToast.js`：模块级单例提示队列，`App.vue` 只挂一个 `ToastStack`。
- `src/data/products.js`：商品与分类的唯一数据源。
- `src/assets/styles/main.css`：颜色、字体、`.shell` 等全局样式。
- `docs/`：需求、结构、模块清单。`docs/modules.md` 是组件清单的唯一真相源。
- `scripts/`：验证、截图、图片下载脚本；`tests/`：结构测试。

## 代码约定

- 组件一律 `<script setup>`，props/emits 用对象写法并标注类型与默认值。
- 派生数据用 `computed`；只有副作用（如写 localStorage、清校验提示）才用 `watch`。
- `v-for` 一律带稳定的 `:key`；`v-if` 与 `v-for` 不同时出现在一个元素上。
- 不要直接改 props；需要修改时通过 emits 交回父组件。
- 注释只解释“为什么”，不重复代码含义。

## 教程对应关系

`README.md` 的“教程知识点落点”是唯一对照表，行号以当前源码为准。新增或替换功能后要同步它，
并保证 `tests/site-structure.test.mjs` 的逐文件断言仍然通过——这份测试按文件校验，
所以落点写错文件会直接变红，不能靠“某个正则在全项目里能匹配”蒙过去。

## 图片

- 位于 `public/images/`，来源记录在 `public/images/SOURCES.json`。
- 不使用运行时外链，避免部署后图片失效。

## 受保护文件

- `小满咖啡-Vue实验报告.docx` 与 `小满咖啡-Vue实验报告(预览).pdf` 是历史交付物，
  **不要重新生成或修改**，除非用户明确要求。
- 这两份文件**不在项目根**，在上一级目录 `D:\Github\Work\`（与 `实验报告模板.docx` 同级）。
  判断有没有被改动看修改时间：两者为 21:12，早于仓库里全部源码（22:06 之后）。
- 旧报告生成脚本与旧截图已移入 `_trash/simplify-20261025/`，不要恢复为当前流程。

## 禁止事项

- 不把 `dist/`、`node_modules/`、`_trash/` 提交到仓库。
- 交付打包只含 `src/`、`public/`、`tests/`、`scripts/`、`docs/` 与根目录配置文件；
  `_trash/` 里还有 18 个旧版 `.vue`，打包进去会让“正好 15 个组件”产生歧义。
- 不伪造测试结果；`pnpm test` 或 `verify.mjs` 未通过就如实说明。
