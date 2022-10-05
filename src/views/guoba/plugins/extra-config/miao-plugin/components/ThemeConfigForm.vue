<template>
  <div>
    <BasicForm @register="registerForm" />
    <div v-if="showBtn" style="text-align: center">
      <a-button type="primary" preIcon="ant-design:save" @click="onSave">保存皮肤配置</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { FormActionType } from '/@/components/Form';
  import type { ThemeConfigType } from '../types';
  import { ref, watch } from 'vue';
  import lodash from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useThemeConfigSchemas } from '../miao.data';
  import { saveThemeConfig } from '../miao.api';

  const props = defineProps({
    model: Object as PropType<ThemeConfigType>,
    themeName: String,
    themeNames: Array as PropType<string[]>,
    debugThemeName: String,
  });
  const emit = defineEmits(['update:model', 'update:debugThemeName']);
  const { createMessage: $message } = useMessage();

  const showFn = (model) => model.debugTheme && model.currentTheme;
  const [registerFormOrigin, { setFieldsValue, updateSchema, validate }] = useForm({
    schemas: [
      {
        field: 'debugTheme',
        label: '调试皮肤',
        component: 'Switch',
        bottomHelpMessage: '对已有皮肤进行实时调试（需要手动保存）',
      },
      {
        field: 'currentTheme',
        label: '选择皮肤',
        component: 'Select',
        show: ({ model }) => model.debugTheme,
        bottomHelpMessage: '若要新增或删除皮肤，请点击右上角的“皮肤”按钮。',
      },
      ...useThemeConfigSchemas({
        show: ({ model }) => showFn(model),
      }),
    ],
    labelWidth: 120,
    labelAlign: 'right',
    labelCol: { xs: 24, sm: 5 },
    wrapperCol: { xs: 24, sm: 19 },
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
  });

  const showBtn = ref(false);

  async function registerForm(formAction: FormActionType, formModel) {
    registerFormOrigin(formAction);
    await initSchema();
    await initModel(formModel);
  }

  async function initSchema() {
    watch(
      () => props.themeNames,
      async (names) => {
        if (!Array.isArray(names)) {
          names = [];
        }
        // 排除 default
        names = names.filter((name) => name !== 'default');
        let options = names.map((name) => ({ label: name, value: name }));
        if (options.length === 0) {
          await setFieldsValue({ currentTheme: null });
        }
        await updateSchema([{ field: 'currentTheme', componentProps: { options } }]);
      },
      { deep: true, immediate: true },
    );
  }

  async function initModel(formModel) {
    await setFieldsValue(props.model);
    // 监听 propsModel
    watch(
      () => props.model,
      () => setFieldsValue(props.model),
      { deep: true },
    );
    // 监听 formModel
    watch(
      formModel,
      (model) => {
        emit('update:model', model);
        showBtn.value = showFn(model);
        let debugThemeName = showBtn.value ? model.currentTheme || '' : '';
        emit('update:debugThemeName', debugThemeName);
      },
      { immediate: true },
    );
    // 监听是否调试皮肤开关
    watch(
      () => formModel.debugTheme,
      (newVal, oldValue) => {
        if (newVal === true && !oldValue) {
          formModel.currentTheme = props.themeName || '';
        }
      },
      { immediate: true },
    );
  }

  async function onSave() {
    let values = await validate();
    let formData = lodash.omit(values, ['debugTheme', 'currentTheme']);
    await saveThemeConfig(values.currentTheme, formData);
    $message.success('保存成功~');
  }
</script>

<style scoped></style>
