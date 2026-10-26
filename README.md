# 小满咖啡 · XIAOMAN COFFEE

Vue 3 纯前端咖啡店网站，课程作业。全站 **3 个页面、15 个单文件组件**，无后端、无 UI 组件库。

公网地址：<https://lexllo312.github.io/xiaoman-coffee/>

## 页面

| 路由 | 页面 | 功能 |
| --- | --- | --- |
| `/` | 首页 | 品牌主视觉、本周推荐、粉水比计算器 |
| `/menu` | 菜单 | 6 款咖啡、搜索、分类筛选、详情弹窗、加购 |
| `/cart` | 购物车 | 数量增减、金额汇总、收货信息校验、下单演示 |

## 技术栈

- Vue 3 `<script setup>` / Composition API
- Vue Router 4
- Pinia 3
- Vite 6
- 原生 CSS

## 本地运行

```bash
npm install
node scripts/fetch-images.mjs   # 首次克隆后下载 6 张商品图
npm run dev                     # http://localhost:5173
npm run build                   # 生成 dist/
npm run preview                 # 预览构建结果，默认 4173 端口
```

`public/images/*.jpg` 不提交到仓库，由 `fetch-images.mjs` 在本地或 GitHub Actions 中下载。

## 代码结构

```text
src/
├── main.js                 # 创建应用，安装 Pinia 和 Router
├── App.vue                 # 页头 + RouterView + 页脚 + 全局提示
├── router/index.js         # 3 条页面路由和未知路径重定向
├── data/products.js        # 6 件商品与分类
├── stores/cart.js          # Pinia 购物车与 localStorage 持久化
├── composables/useToast.js # 单层提示队列
├── views/                  # HomeView / MenuView / CartView
├── components/             # 11 个可复用组件
└── assets/styles/          # 全局样式
```

一次加购的链路：

```text
ProductCard emit('add')
  → 页面 addToCart()
    → cart.add(product) 判断库存
      → lines 变化
        → count / subtotal / total 等 computed 更新
          → 页头数量、购物车页同步刷新
            → watch 写入 localStorage
```

## GitHub Pages

`.github/workflows/pages.yml` 在 `main` 分支推送后自动执行：

1. `npm install`
2. 下载商品图片
3. `npm run build`，使用 `STATIC_BASE=/<repo>/`
4. 上传 `dist/` 并部署到 GitHub Pages

当前站点：<https://lexllo312.github.io/xiaoman-coffee/>
