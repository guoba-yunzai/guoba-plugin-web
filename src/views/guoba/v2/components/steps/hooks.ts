import type { FormSchema } from '/@/components/Form';
import type { StepBtnProps } from './types';
import { computed, watch } from 'vue';
import lodash from 'lodash-es';
import { defineStore } from 'pinia';
import { FormActionType, useForm } from '/@/components/Form';
import { defHttp } from '/@/utils/http/axios';

interface UseStepProps extends StepBtnProps {
  prevCheck?: () => boolean;
  nextCheck?: () => boolean;
  schemas?: FormSchema[];
}

export function useStep(props: UseStepProps, { emit }) {
  let ins: Nullable<Recordable> = null;

  const stepStore = useStepStore();

  const models = computed(() => stepStore.models);

  let registerForm: any = null;

  if (props.schemas) {
    const [registerFormOrigin] = useForm({
      schemas: props.schemas,
      labelWidth: 120,
      labelAlign: 'right',
      showActionButtonGroup: false,
      baseColProps: { span: 24 },
      labelCol: { xs: 24, sm: 8 },
      wrapperCol: { xs: 24, sm: 16 },
    });
    registerForm = function (formAction: FormActionType, formModel) {
      registerFormOrigin(formAction);
      watch(models, (v) => lodash.merge(formModel, v), { deep: true, immediate: true });
      watch(formModel, (v) => lodash.merge(models.value, v), { deep: true });
    };
  }

  function onRegister(_ins: Recordable) {
    ins = _ins;
    ins.setProps(
      lodash.merge(
        {
          prevBtn: { onClick: () => onCheck('prev') },
          nextBtn: { onClick: () => onCheck('next') },
        },
        props,
      ),
    );
  }

  function onCheck(key: string) {
    let fn = props[`${key}Check`];
    let flag = true;
    if (typeof fn === 'function') {
      flag = fn();
    }
    if (flag) emitStep(key);
  }

  function emitStep(key) {
    emit(key, {});
  }

  return [
    onRegister,
    {
      emitStep,
      models,
      stepStore,
      registerForm,
    },
  ];
}

interface StepStore {
  models: {
    // 迁移方式
    mode: 'full' | 'choose';
    // 安装方式
    installMode: 'new' | 'exist';
    // 安装路径
    installPath: string;
    // git地址
    gitAddress: 'github' | 'gitee';

    // 迁移用户cookie
    userCookie: boolean;
    // 迁移公共cookie
    commonCookie: boolean;
    // 迁移用户抽卡记录
    userGacha: boolean;
    // 用户札记数据
    userNote: boolean;
    // 迁移group_id绑定关系
    groupBind: boolean;
    // 添加的表情、词条
    groupFace: boolean;

    // 基础配置，包括：主人QQ号、自动同意加好友、自动退小群、Cookie文档地址、使用用户Cookie、pushTask推送任务、黑名单QQ号
    cfg_basic: boolean;
    // 配置：公告推送
    cfg_pushNews: boolean;
    // 迁移群默认配置
    cfg_groupDefault: boolean;
    // 迁移群单独配置
    cfg_group: boolean;

    // 喵喵插件：用户数据
    miao_userData: boolean;
    // 成就插件：用户数据
    ach_userData: boolean;

    // 安装依赖的方式（none=不安装）
    moduleTool: 'none' | 'pnpm' | 'npm' | 'cnpm' | 'yarn';
    // 清理redis
    redisClean: boolean;
    // 清理垃圾文件
    rubbishClean: boolean;
    // 迁移JS插件
    transferJs: boolean;
    // 强制迁移JS插件，即使不兼容
    transferJsForce: boolean;
    // JS插件迁移详情
    jsPluginInfo: {
      // 可以迁移的
      passed: Nullable<Recordable[]>;
      // 疑似不兼容的
      noPass: Nullable<Recordable[]>;
    };
  };
  status: {
    // 0 = 未开始，1 = 进行中，2 = 成功， 3 = 失败
    state: 0 | 1 | 2 | 3;
    // 进度
    percent: number;
    // 日志
    logs: string[];
    // 失败原因
    reason: string;
  };
  timer: NodeJS.Timer | null;
}

export const useStepStore = defineStore({
  id: 'v2-steps',
  state: (): StepStore => ({
    models: {
      mode: 'full',
      installMode: 'new',
      installPath: '',
      gitAddress: 'gitee',
      userCookie: true,
      groupBind: true,
      userGacha: true,
      miao_userData: true,
      ach_userData: true,
      cfg_basic: true,
      commonCookie: true,
      cfg_group: true,
      cfg_groupDefault: true,
      cfg_pushNews: true,
      groupFace: true,
      userNote: true,
      redisClean: false,
      rubbishClean: true,
      moduleTool: 'pnpm',
      transferJs: false,
      transferJsForce: false,
      jsPluginInfo: { passed: null, noPass: null },
    },
    status: {
      state: 0,
      logs: [],
      percent: 0,
      reason: '',
    },
    timer: null,
  }),
  getters: {},
  actions: {
    async updateStatus() {
      this.status = await defHttp.get({ url: '/v2-transfer/status' });
    },
    startPolling() {
      if (!this.timer) {
        this.timer = setInterval(() => this.updateStatus(), 1000);
      }
    },
    stopPolling() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  },
});
