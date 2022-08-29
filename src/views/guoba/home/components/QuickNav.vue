<template>
  <Card title="快捷导航" v-bind="$attrs">
    <CardGrid class="quick-nav-item" v-for="item in navItems" :key="item">
      <router-link :to="item.path" class="flex flex-col items-center">
        <Icon :icon="item.icon" :color="item.color" size="20" />
        <span class="text-md mt-2">{{ item.title }}</span>
      </router-link>
    </CardGrid>
  </Card>
</template>
<script lang="ts" setup>
  import { Card } from 'ant-design-vue';
  import { navItems } from './data';
  import { Icon } from '/@/components/Icon';
  // TODO-guoba 改成接口
  const CardGrid = Card.Grid;

</script>

<style lang="less" scoped>

  .quick-nav-item {
    cursor: pointer;
    padding: 0;
    
    & > a {
      padding: 24px;
      color: @text-color-base;
    }
  }
</style>
