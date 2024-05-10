<template>
  <Card title="插件" v-bind="$attrs">
    <template #extra>
      <a-button type="link" size="small">
        <router-link to="/plugins">更多</router-link>
      </a-button>
    </template>
    <template v-for="(item, idx) of plugins" :key="item.name">
      <CardGrid v-if="idx < 12" class="!md:w-1/3 !w-full plugin-item" @click="() => onClick(item)">
        <span class="flex">
          <PluginIcon :plugin="item" :size="30" />
          <span class="text-lg ml-4 ellipsis" :title="item.title">
            <span v-if="item.isDeleted" style="text-decoration: line-through">{{
              item.title
            }}</span>
            <span v-else>{{ item.title }}</span>
          </span>
        </span>
        <div class="flex mt-2 h-10 text-secondary">
          <div class="ellipsis" :title="item.description">
            {{ item.description }}
          </div>
        </div>
        <div class="flex justify-between text-secondary ellipsis" style="max-width: 100%">
          <span class="ellipsis" style="max-width: calc(100% - 100px)">
            {{ parseAuthor(item.author) }}
          </span>
          <span>
            <Tag v-if="item.hasConfig" color="purple">可配置</Tag>
            <Tag v-if="item.installed" color="green">已安装</Tag>
            <Tag v-else>未安装</Tag>
          </span>
        </div>
      </CardGrid>
    </template>
    <GPluginModal @register="registerModal" />
  </Card>
</template>
<script lang="ts">
  import type { PropType } from 'vue';
  import { defineComponent } from 'vue';
  import type { Plugin, Plugins } from '/#/guoba';
  import { Card, Tag } from 'ant-design-vue';
  import { Icon } from '/@/components/Icon';
  import { useModal } from '/@/components/Modal';
  import GPluginModal from '/@/components/Guoba/src/GPluginModal.vue';
  import PluginIcon from '/@/components/Guoba/src/components/PluginIcon.vue';
  import { useGo } from '/@/hooks/web/usePage';

  export default defineComponent({
    components: {
      Card,
      CardGrid: Card.Grid,
      Icon,
      Tag,
      GPluginModal,
      PluginIcon,
    },
    props: {
      plugins: {
        type: Array as PropType<Plugins>,
        required: true,
      },
    },
    setup() {
      const [registerModal, { openModal }] = useModal();
      const go = useGo();

      function onClick(plugin: Plugin) {
        if (plugin.showInMenu) {
          // 跳转到插件详情页
          go(`/plugin/@/${plugin.name}`);
        } else {
          openModal(true, { plugin });
        }
      }

      /**
       * 兼容数组和字符串的情况
       * @param author
       */
      function parseAuthor(author) {
        if (Array.isArray(author)) {
          return author.join(' ');
        }
        return author;
      }

      return {
        onClick,
        parseAuthor,
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
