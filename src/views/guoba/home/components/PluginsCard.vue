<template>
  <Card title="插件" v-bind="$attrs">
    <template #extra>
      <a-button type="link" size="small">
        <router-link to="/plugins">更多</router-link>
      </a-button>
    </template>
    <template v-for="(item,idx) of plugins" :key="item.name">
      <CardGrid v-if="idx<12" class="!md:w-1/3 !w-full plugin-item" @click="()=>onClick(item)">
        <span class="flex">
          <Icon v-if="item.icon" :icon="item.icon" :color="item.color" size="30" />
          <Icon v-else icon="clarity:plugin-line" size="30" />
          <span class="text-lg ml-4 ellipsis" :title="item.title">
            <span v-if="item.isDeleted" style="text-decoration: line-through;">{{ item.title }}</span>
            <span v-else>{{ item.title }}</span>
          </span>
        </span>
        <div class="flex mt-2 h-10 text-secondary ">
          <div class="ellipsis" :title="item.description">
            {{ item.description }}
          </div>
        </div>
        <div class="flex justify-between text-secondary">
          <span>{{ item.author }}</span>
          <Tag v-if="item.installed" color="green">已安装</Tag>
          <Tag v-else>未安装</Tag>
        </div>
      </CardGrid>
    </template>
    <GPluginModal @register="registerModal" />
  </Card>
</template>
<script lang="ts">
  import type { PropType } from 'vue';
  import { defineComponent } from 'vue';
  import type { Plugins } from '/#/guoba';
  import { Card, Tag } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { useModal } from '/@/components/Modal';
  import GPluginModal from '/@/components/Guoba/src/GPluginModal.vue';

  export default defineComponent({
    components: {
      Card,
      CardGrid: Card.Grid,
      Icon,
      Tag,
      GPluginModal,
    },
    props: {
      plugins: {
        type: Array as PropType<Plugins>,
        required: true,
      },
    },
    setup() {
      const [registerModal, { openModal }] = useModal();

      function onClick(plugin) {
        openModal(true, { plugin });
      }

      return {
        onClick,
        registerModal,
      };
    },
  });
</script>
<style lang="less" scoped>
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .plugin-item {
    cursor: pointer;
  }
</style>
