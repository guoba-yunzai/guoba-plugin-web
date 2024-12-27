<template>
  <div :class="[prefixCls]">
    <Skeleton v-if="pageLoading" active />
    <div v-else-if="errorRef.isError">
      <Exception :status="errorRef.status" :title="errorRef.title" :subTitle="errorRef.message" btnText="返回插件管理" goPath="/plugins" />
    </div>
    <PageWrapper v-else :loading="loading" sticky stickyTop="-50px">
      <template #title>
        <div class="plugin-title">
          <PluginIcon :plugin="plugin!" :size="24" />
          <a class="title-name" @click="onOpenPluginModal">{{ plugin!.title }}</a>
          <a :href="plugin!.link" target="_blank" style="margin-left: 4px">
            <Icon icon="bx:link" style="font-size: 20px" />
          </a>
        </div>
      </template>

      <template #headerContent>
        <div class="plugin-content">
          <div class="content-desc ellipsis">{{ plugin!.description }}</div>
          <!--          <div style="margin-top: 12px">-->
          <!--            <template v-for="(author, idx) of authorList">-->
          <!--              <a :href="author.link" target="_blank">{{ author.name }}</a>-->
          <!--              <a-divider v-if="idx !== authorList.length - 1" type="vertical" />-->
          <!--            </template>-->
          <!--          </div>-->
        </div>
      </template>

      <template #footer>
        <a-row>
          <a-col :xxl="22" :xl="22" :lg="20" :md="20" :sm="19" :xs="17">
            <a-tabs v-if="groupList.length > 0" v-model:activeKey="activeGroupKey">
              <a-tab-pane :key="group.name" v-for="group of groupList">
                <template #tab>
                  <div class="ellipsis" style="max-width: 120px">{{ group.title }}</div>
                </template>
              </a-tab-pane>
            </a-tabs>
          </a-col>
          <a-col :xxl="2" :xl="2" :lg="4" :md="4" :sm="5" :xs="7" style="text-align: right; padding-bottom: 8px">
            <a-button type="primary" pre-icon="ant-design:save" @click="onSave">
              <span>保存</span>
            </a-button>
          </a-col>
        </a-row>
      </template>

      <a-row justify="center">
        <a-col :xxl="16" :xl="18" :lg="20" :md="22" :sm="24" :xs="24">
          <a-card>
            <PluginConfigForm ref="configFormRef" soft-grouping v-model:activeGroupKey="activeGroupKey" v-model:softGroupList="groupList" :plugin="plugin!" />

            <div style="text-align: center">
              <a-button type="primary" pre-icon="ant-design:save" @click="onSave">
                <span>保存</span>
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <GPluginModal @register="registerModal" />
    </PageWrapper>
  </div>
</template>

<script lang="ts" setup>
  import type { Plugin } from '/#/guoba';
  import { computed, reactive, ref } from 'vue';
  import { router } from '/@/router';
  import Icon from '/@/components/Icon';
  import { Skeleton } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { Exception } from '/@/views/sys/exception';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useGuobaStore } from '/@/store/guoba';
  import { ExceptionEnum } from '/@/enums/exceptionEnum';
  import PluginConfigForm from '/@/components/Guoba/src/components/PluginConfigForm.vue';
  import GPluginModal from '/@/components/Guoba/src/GPluginModal.vue';
  import { useModal } from '/@/components/Modal';
  import PluginIcon from '/@/components/Guoba/src/components/PluginIcon.vue';

  const { prefixCls } = useDesign('plugin-detail');
  const guobaStore = useGuobaStore();

  const configFormRef = ref();

  const loading = ref(true);
  const pageLoading = ref(true);

  const errorRef = reactive({
    isError: false,
    status: ExceptionEnum.PAGE_NOT_FOUND,
    title: '404',
    message: '未找到该插件',
  });

  const name = computed(() => (router.currentRoute.value.params?.name ?? '') as string);

  const plugin = ref<Plugin>();

  // const authorList = computed(() => {
  //   if (!plugin.value) return [];
  //   const { author, authorLink } = plugin.value;
  //   const names: string[] = Array.isArray(author) ? author : [author];
  //   const links: string[] = Array.isArray(authorLink) ? authorLink : [authorLink];
  //   return names.map((name, idx) => ({ name, link: links[idx] }));
  // });

  async function loadPlugin() {
    try {
      if (!name.value) {
        errorRef.isError = true;
        errorRef.title = '非法的插件名';
        errorRef.message = '遇到该问题请刷新页面重试！';
        errorRef.status = ExceptionEnum.ERROR;
        return;
      }
      const plugins = await guobaStore.getPlugins();
      const find = plugins.find((item) => item.name === name.value);
      if (!find) {
        errorRef.isError = true;
        errorRef.title = '插件不存在';
        errorRef.message = ' ';
        return;
      }
      if (!find.installed) {
        errorRef.isError = true;
        errorRef.status = ExceptionEnum.PAGE_NOT_DATA;
        errorRef.title = '插件未安装';
        errorRef.message = ' ';
        return;
      }
      plugin.value = find;
    } finally {
      pageLoading.value = false;
      loading.value = false;
    }
  }

  loadPlugin();

  // 当前激活的分组
  const activeGroupKey = ref('default');
  // 分组列表
  const groupList = ref<{ name: string; title: string }[]>([]);

  async function onSave() {
    try {
      loading.value = true;
      await configFormRef.value!.savePluginConfigData();
    } finally {
      loading.value = false;
    }
  }

  const [registerModal, { openModal }] = useModal();

  function onOpenPluginModal() {
    openModal(true, { plugin: plugin.value });
  }
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-plugin-detail';
  .@{prefix-cls} {
    .plugin-title {
      * {
        vertical-align: middle;
      }

      .title-name {
        margin-left: 8px;
      }

      a:not(:hover) {
        color: @text-color-base;
      }
    }

    .plugin-content {
      .content-desc {
        width: 100%;
      }
    }

    .ellipsis {
      // 溢出显示省略号
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
