<template>
  <div class="step-box">
    <div class="step-tip">请选择迁移项</div>

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
  import { useStep } from './hooks';
  import StepBtn from './StepBtn.vue';

  const emit = defineEmits(['prev', 'next']);

  // @ts-ignore
  const [onStepBtnRegister, { models, registerForm }] = useStep(
    {
      schemas: [
        {
          field: 'userCookie',
          label: '用户Cookie',
          component: 'Switch',
          bottomHelpMessage: '迁移用户绑定的Cookie（不验证有效性）',
        },
        {
          field: 'commonCookie',
          label: '公共Cookie',
          component: 'Switch',
          bottomHelpMessage: '迁移公共Cookie（不验证有效性）',
        },
        {
          field: 'userGacha',
          label: '用户抽卡记录',
          component: 'Switch',
          bottomHelpMessage: '用户的抽卡记录，推荐迁移',
        },
        {
          field: 'userNote',
          label: '用户札记数据',
          component: 'Switch',
          bottomHelpMessage: '用户的札记数据，用于原石统计，推荐迁移',
        },
        {
          field: 'groupFace',
          label: '添加的表情',
          component: 'Switch',
          bottomHelpMessage: '迁移添加的词条、表情',
        },
        {
          field: 'groupBind',
          label: '群聊绑定',
          component: 'Switch',
          bottomHelpMessage: '迁移用户QQ号和群号的绑定关系（需操作redis）',
        },
        {
          field: 'cfg_basic',
          label: '基础配置',
          component: 'Switch',
          bottomHelpMessage: '基础配置，包括：主人QQ号、自动同意加好友、自动退小群、Cookie文档地址、使用用户Cookie、pushTask推送任务、黑名单QQ号',
        },
        {
          field: 'cfg_pushNews',
          label: '推送配置',
          component: 'Switch',
          bottomHelpMessage: '推送新公告、资讯等信息的群聊配置',
        },
        {
          field: 'cfg_groupDefault',
          label: '群聊默认配置',
          component: 'Switch',
          bottomHelpMessage: '迁移群聊的默认配置（由于禁用功能等配置项不通用，故不迁移）',
        },
        {
          field: 'cfg_group',
          label: '群聊单独配置',
          component: 'Switch',
          bottomHelpMessage: '迁移群聊的单独配置',
        },
        {
          field: 'miao_userData',
          label: '喵喵：用户数据',
          component: 'Switch',
          bottomHelpMessage: '喵喵插件，包括面板等用户数据（未安装可以忽略）',
        },
        {
          field: 'ach_userData',
          label: '成就：用户数据',
          component: 'Switch',
          bottomHelpMessage: '成就插件，迁移用户已完成的成就（未安装可以忽略）',
        },
      ],
    },
    { emit },
  );
</script>
<style scoped></style>
