<script setup>
// 站内所有按钮都用于页面跳转，因此这里只封装 RouterLink，避免维护无用分支。
defineProps({
  to: { type: [String, Object], required: true },
  variant: { type: String, default: 'primary' }
})
</script>

<template>
  <RouterLink :to="to" class="button" :class="variant">
    <slot />
  </RouterLink>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 22px;
  border: 1px solid var(--bean);
  border-radius: 999px;
  background: var(--bean);
  color: #fffaf2;
  font-size: 14px;
  transition: background 0.2s, transform 0.2s;
}
.button:hover { background: var(--bean-deep); transform: translateY(-1px); }
.button.ghost { background: transparent; color: var(--bean); border-color: var(--line); }
</style>
