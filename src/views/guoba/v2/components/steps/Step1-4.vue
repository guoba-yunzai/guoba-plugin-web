<template>
  <div class="step-box">
    <div class="step-tip">迁移配置</div>

    <transition-group name="fade-slide" mode="out-in" appear>
      <div class="basic-form" key="trans-form">
        <BasicForm @register="registerForm" />
      </div>
    </transition-group>

    <StepBtn @register="onStepBtnRegister" />
  </div>
</template>

<script lang="ts" setup>
  import { BasicForm } from '/@/components/Form';
  import { h, inject, reactive, watch } from 'vue';
  import { Divider } from 'ant-design-vue';
  import { noop } from '/@/utils';
  import { defHttp } from '/@/utils/http/axios';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useStep } from './hooks';
  import StepBtn from './StepBtn.vue';

  const emit = defineEmits(['prev', 'next']);
  const setPageLoading = inject<Fn>('setPageLoading', noop);

  const HSeeInfo = h('a', { onClick: onSeeInfo }, '查看详情');
  const HRecheck = h('a', { onClick: onRecheck }, '重新检测');
  const HActions = [HSeeInfo, h(Divider, { type: 'vertical' }), HRecheck];

  // @ts-ignore
  const [onStepBtnRegister, { models, registerForm }] = useStep(
    {
      nextBtn: {
        text: '开始迁移',
      },
      schemas: [
        {
          field: 'rubbishClean',
          label: '过滤垃圾文件',
          component: 'Switch',
          helpMessage: [
            '垃圾文件指的是：',
            '1. 生成图片导致的html文件缓存。',
            '（即以html为后缀的文件）',
            '仅清理这一项，其他文件不清理。',
          ],
          bottomHelpMessage: '是否过滤“data”文件夹中的垃圾文件',
        },
        {
          field: 'redisClean',
          label: 'Redis清理',
          component: 'Switch',
          helpMessage: '如果你扔想保留V2的数据，则不要清理。',
          bottomHelpMessage: '仅清理V2版本遗留的用户UID绑定关系（谨慎）',
        },
        {
          field: 'transferJs',
          label: '迁移JS插件',
          component: 'Switch',
          bottomHelpMessage: '仅处理"lib/example"下的JS插件',
        },
        {
          field: 'transferJsInfo',
          label: 'JS插件迁移详情',
          component: 'Input',
          render: () => {
            const jsPluginInfo = models.value.jsPluginInfo;
            let passed = jsPluginInfo.passed?.length || 0;
            let noPass = jsPluginInfo.noPass?.length || 0;
            let total = passed + noPass;
            if (total === 0) {
              return '未检测到JS插件';
            }
            let text = `检测到 ${total} 个JS插件，`;
            if (noPass === 0) {
              text += `全部可以迁移。`;
            } else if (passed === 0) {
              text += `全部不兼容。`;
            } else {
              text += `其中 ${noPass} 个不兼容， ${passed} 个可以迁移。`;
            }
            return h('div', {}, [text, HActions]);
          },
          bottomHelpMessage: '',
          ifShow: ({ model }) =>
            models.value.jsPluginInfo.passed != null && model.transferJs === true,
        },
      ],
    },
    { emit },
  );

  watch(
    () => models.value.transferJs,
    (val) => {
      if (val && models.value.jsPluginInfo.passed == null) {
        onRecheck();
      }
    },
  );
  const { createSuccessModal, createWarningModal } = useMessage();

  async function onRecheck() {
    setPageLoading(true, '正在分析JS插件');
    try {
      let res = await defHttp.get({ url: '/v2-transfer/check-js' }, { errorMessageMode: 'modal' });
      models.value.jsPluginInfo.passed = res.passed;
      models.value.jsPluginInfo.noPass = res.noPass;
    } finally {
      setPageLoading(false);
    }
  }

  function onSeeInfo() {
    const { noPass } = models.value.jsPluginInfo;
    if (noPass!.length > 0) {
      createWarningModal({
        title: '不兼容的插件',
        content: h('span', [
          ...noPass!.map((i) => {
            return h('span', [
              renderLine('插件名称', i.file),
              h('br'),
              renderLine('原因', i.reason, '#ff7e7e'),
              h('br'),
              renderLine('第' + i.lineNum + '行', i.line),
              h('br'),
              h('br'),
            ]);
          }),
        ]),
        onOk: showPassedModal,
      });
    } else {
      showPassedModal();
    }
  }

  function showPassedModal() {
    const { passed } = models.value.jsPluginInfo;
    if (passed!.length > 0) {
      createSuccessModal({
        title: '可迁移的插件',
        content: h('span', [
          '注意事项：',
          h('br'),
          '1. 可迁移仅代表Guoba没有检测到不兼容的写法，不代表不会存在包括但不限于依赖缺失、其他不兼容的写法等问题。',
          h('br'),
          '2. 迁移到V3后，这些插件会运行在Guoba提供的“兼容V2插件”的容器里运行，如果存在报错将会拒绝执行插件，所以不用担心因报错无法启动的问题。',
          h('br'),
          h('br'),
          ...passed!.map((i) => {
            return h('span', [renderLine('插件名称', i.file), h('br')]);
          }),
        ]),
      });
    }
  }

  function renderLine(label, content, color = '#333') {
    return h('span', [h('span', {}, label + '：'), h('span', { style: { color } }, content)]);
  }
</script>

<style scoped></style>
