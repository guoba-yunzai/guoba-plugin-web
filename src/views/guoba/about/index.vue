<template>
  <PageWrapper title="关于" sticky dense>
    <template #headerContent>
      <div class="flex items-center justify-between">
        <span class="flex-1">
          <a :href="GITHUB_URL" target="_blank">Guoba-Plugin</a>
          是一个
          <a href="https://github.com/Le-niao/Yunzai-Bot" target="_blank">Yunzai-Bot</a>
          的插件，主要用于提供后台管理界面。 基于Vue-VBen-Admin、Vue3.0、Vite、Ant-Design-Vue、TypeScript开发。
        </span>
      </div>
    </template>

    <template #footer>
      <a-tabs v-model:activeKey="activeKey">
        <template v-for="tab in tabPanes" :key="tab.key">
          <a-tab-pane :tab="tab.title" />
        </template>
      </a-tabs>
    </template>

    <div v-show="activeKey === 'about'" key="about" class="p-4">
      <Description @register="infoRegister" class="enter-y" />
      <Description @register="register" class="my-4 enter-y" />
      <Description @register="registerDev" class="enter-y" />
    </div>
    <div v-show="activeKey === 'todo'" key="todo" class="p-4 bg-white">
      <LoadGitee />
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { h, ref } from 'vue';
  import { Tag } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import { Description, DescItem, useDescription } from '/@/components/Description';
  import { GITHUB_URL, SITE_URL, DOC_URL, GITEE_URL } from '/@/settings/siteSetting';
  // import LoadGist from './LoadGist.vue';
  import LoadGitee from './LoadGitee.vue';

  import { pkg, lastBuildTime } from '/@/utils/appInfo';

  // noinspection JSUnusedGlobalSymbols
  const _components = { PageWrapper, Description, LoadGitee };

  const { dependencies, devDependencies, name, version } = pkg;
  const schema: DescItem[] = [];
  const devSchema: DescItem[] = [];

  const commonTagRender = (color: string) => (curVal) => h(Tag, { color }, () => curVal);

  const commonLinkRender = (text: string) => (href) => h('a', { href, target: '_blank' }, text);

  const activeKey = ref('about');

  const tabPanes = ref([
    { key: 'about', title: '关于' },
    { key: 'todo', title: '咕咕咕' },
  ]);

  const infoSchema: DescItem[] = [
    {
      label: '版本',
      field: 'version',
      render: commonTagRender('blue'),
    },
    {
      label: '最后编译时间',
      field: 'lastBuildTime',
      render: commonTagRender('blue'),
    },
    // {
    //   label: '文档地址',
    //   field: 'doc',
    //   render: commonLinkRender('文档地址'),
    // },
    // {
    //   label: '预览地址',
    //   field: 'preview',
    //   render: commonLinkRender('预览地址'),
    // },
    {
      label: 'Github',
      field: 'github',
      render: commonLinkRender('Github仓库地址'),
    },
    {
      label: 'Gitee',
      field: 'gitee',
      render: commonLinkRender('Gitee仓库地址'),
    },
  ];

  const infoData = {
    version: window['__YUNZAI_BOT_CONF__']['GUOBA_VERSION'] || version,
    lastBuildTime,
    doc: DOC_URL,
    preview: SITE_URL,
    github: GITHUB_URL,
    gitee: GITEE_URL,
  };

  Object.keys(dependencies).forEach((key) => {
    schema.push({ field: key, label: key });
  });

  Object.keys(devDependencies).forEach((key) => {
    devSchema.push({ field: key, label: key });
  });

  const [register] = useDescription({
    title: '生产环境依赖',
    data: dependencies,
    schema: schema,
    column: 3,
  });

  const [registerDev] = useDescription({
    title: '开发环境依赖',
    data: devDependencies,
    schema: devSchema,
    column: 3,
  });

  const [infoRegister] = useDescription({
    title: '项目信息',
    data: infoData,
    schema: infoSchema,
    column: 2,
  });
</script>
