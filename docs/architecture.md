# 结构与数据流

## 分层

```
index.html
└── src/main.js              createApp + Pinia + Router
    └── App.vue              页头 + RouterView + 页脚 + 全局提示
        ├── AppHeader        3 个导航链接 + 购物车数量
        ├── RouterView       HomeView / MenuView / CartView
        ├── AppFooter
        └── ToastStack       加购提示
```

App 级组件（3 个，只出现在 `App.vue` 里）：`AppHeader`、`AppFooter`、`ToastStack`。

页面级组件（8 个）：`ProductCard` + `ProductImage`（列表与图片）、`SearchBar`、`BaseModal`
（菜单详情与下单成功共用）、`CartLine`、`OrderSummary`、`BaseInput`、`BaseButton`。

## 路由表

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | HomeView | 主视觉、推荐商品、冲煮比例 |
| `/menu` | MenuView | 搜索、分类、详情弹窗 |
| `/cart` | CartView | 购物车、收货信息、下单 |
| 其他 | 重定向 `/` | 不额外创建 404 组件 |

## 状态设计

唯一的全局状态是 `src/stores/cart.js`（Pinia setup store）。

- `lines` 只保存 `{ id, qty }`，商品名称和价格每次从 `products.js` 读取。
- `restore()` 启动时校验 localStorage：非数组、已下架商品、非数字或越界数量会被丢弃或夹到 `1..库存`，
  所以手改存储不会把页面渲染打崩。
- `items/count/subtotal/shipping/total` 全部由 `computed` 派生；包邮阈值与运费来自
  `FREE_SHIPPING` / `SHIPPING_FEE`，页面不再各写一个 199。
- `add()` 返回布尔：库存到顶返回 `false`，页面据此提示“库存上限”，不会假装加购成功。
- `setQty` 按商品库存夹紧数量，最低为 1；`remove` 删除整行。
- `watch(lines, ...)` 把购物车写进 `localStorage`（写入包了 try/catch），刷新页面后恢复。

其余状态都是组件本地 `ref`：搜索词、分类、详情弹窗、结算表单与错误信息、首页粉量、下单成功标记。
唯一跨组件复用的状态是全局提示队列（`composables/useToast.js`，模块级单例）。

## 一次加购的链路

```
ProductCard 点击
  → emit('add', product)
    → HomeView / MenuView 的 addToCart()
      → cart.add(product)         写 Pinia；返回 false 表示已到库存上限
      → 成功：useToast().push('已加入购物车…')
        失败：useToast().push('库存上限：…只剩 N 件')
        → AppHeader 数量、购物车页金额自动更新
        → watch 写入 localStorage
```

## 样式

- 全局色板、字体、容器宽度在 `src/assets/styles/main.css`，组件内只用 `var(--…)`。
- 每个组件使用 `<style scoped>`；父组件直接写子组件标签样式时要注意 scoped 只作用于子组件根元素。
- 断点：菜单 3 列 → 1000px 两列 → 560px 单列；首页 800px 单列；购物车 900px 收为一列，表单 560px 单列。

## 部署

`pnpm build` 生成 `dist/`，Netlify 构建命令 `pnpm run build`、发布目录 `dist`。
`netlify.toml` 与 `public/_redirects` 都把未知路径回退到 `index.html`。
