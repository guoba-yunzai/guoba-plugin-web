<template>
  <div>
    <span>{{ text }}</span>
    <template v-if="showBatch">
      <a-button type="link" @click="() => emit('clear')"> 取消选择</a-button>
      <Dropdown>
        <a-button type="link" class="ant-dropdown-link">
          批量操作
          <DownOutlined />
        </a-button>
        <template #overlay>
          <Menu @click="(e) => emit('menuClick', e)">
            <Menu.Item key="uninstall-batch">
              <DeleteOutlined />
              批量卸载
            </Menu.Item>
          </Menu>
        </template>
      </Dropdown>
    </template>
  </div>
</template>
<script setup lang="ts">
  import { Dropdown, Menu } from 'ant-design-vue';
  import { DeleteOutlined, DownOutlined } from '@ant-design/icons-vue';

  defineProps({
    text: {
      type: String,
      default: '',
    },
    showBatch: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['clear', 'menuClick']);
</script>

<style scoped lang="less"></style>
