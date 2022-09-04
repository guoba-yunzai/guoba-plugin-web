<template>
  <Skeleton v-if="pageLoading" active />
  <PageWrapper
    v-else
    title="配置管理"
    content="在这里可以配置机器人的基础设置以及原神相关设置"
    :loading="loading"
    sticky
  >
    <template #footer>
      <Tabs v-model:activeKey="activeKey">
        <template v-for="tab in configTabs" :key="tab.key">
          <TabPane :tab="tab.title" />
        </template>
      </Tabs>
    </template>

    <a-row :class="[prefixCls]" justify="center">
      <a-col :xxl="16" :xl="18" :lg="20" :md="22" :sm="24" :xs="24">
        <template v-for="tab of configTabs" :key="tab.key">
          <transition name="scroll-x-transition" mode="out-in">
            <keep-alive>
              <ConfigForm v-if="activeKey === tab.key" :cards="tab.cards" />
            </keep-alive>
          </transition>
        </template>
      </a-col>
    </a-row>
  </PageWrapper>
</template>

<script lang="ts">
  import type { ConfigTabs } from './types';
  import { defineComponent, ref } from 'vue';
  import { Skeleton, Tabs } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { useDesign } from '/@/hooks/web/useDesign';
  import ConfigForm from './components/ConfigForm.vue';
  import { queryConfigTabs } from './config.api';

  export default defineComponent({
    components: {
      PageWrapper,
      Skeleton,
      Tabs,
      TabPane: Tabs.TabPane,
      ConfigForm,
    },
    setup() {
      const { prefixCls } = useDesign('system-config');
      const loading = ref(true);
      const pageLoading = ref(true);
      const configTabs = ref<ConfigTabs>([]);
      const activeKey = ref('');

      async function loadConfig() {
        loading.value = true;
        try {
          configTabs.value = await queryConfigTabs();
          activeKey.value = configTabs.value[0].key;
        } finally {
          loading.value = false;
          pageLoading.value = false;
        }
      }

      loadConfig();

      return {
        prefixCls,
        pageLoading,
        loading,
        configTabs,
        activeKey,
      };
    },
  });
</script>
<style lang="less">
  //noinspection LessUnresolvedVariable
  @ns: ~'@{namespace}';
  @prefix-cls: ~'@{ns}-system-config';

  .@{prefix-cls} {
  }
  .fade-enter-active,
  .fade-leave-active {
    opacity: 1;
    transition: opacity 0.5s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
</style>
