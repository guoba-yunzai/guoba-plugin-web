<template>
  <BasicDrawer
    title="高级设置"
    :width="drawerWidth"
    placement="left"
    showFooter
    :maskStyle="{ backgroundColor: 'rgba(0,0,0,0.2)' }"
    @register="registerDrawer"
  >
    <BasicForm @register="registerForm" />
    <ThemeConfigForm
      :model="themeStyle"
      :themeName="themeName"
      :debugThemeName="debugThemeName"
      :themeNames="themeNames"
      @update:model="emit('update:themeStyle', $event)"
      @update:debugThemeName="emit('update:debugThemeName', $event)"
    />

    <template #footer>
      <a-row type="flex" justify="space-between">
        <a-col>
<!--          TODO-guoba 待办事项：上传图标-->
<!--          <a-button type="primary" @click="">上传图标</a-button>-->
        </a-col>
        <a-col>
          <a-button @click="closeDrawer">关闭</a-button>
        </a-col>
      </a-row>
    </template>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import type { FormActionType } from '/@/components/Form';
  import type { ThemeConfigType } from '../types';
  import { watch, onMounted, nextTick } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { settingSchemas } from '../miao.data';
  import ThemeConfigForm from './ThemeConfigForm.vue';

  const props = defineProps({
    model: { type: Object, default: () => ({}) },
    themeName: String,
    themeNames: Array,
    themeStyle: Object as PropType<ThemeConfigType>,
    debugThemeName: String,
  });
  const emit = defineEmits([
    'register',
    'update:model',
    'update:themeStyle',
    'update:debugThemeName',
  ]);

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner();
  const [registerFormOrigin, { getFieldsValue, setFieldsValue, updateSchema }] = useForm({
    schemas: settingSchemas,
    labelWidth: 120,
    labelAlign: 'right',
    labelCol: { xs: 24, sm: 5 },
    wrapperCol: { xs: 24, sm: 19 },
    showActionButtonGroup: false,
    baseColProps: { span: 24 },
  });
  const drawerWidth = window.innerWidth >= 600 ? '600px' : '100%';

  onMounted(() => {
    // TODO-guoba 临时解决皮肤不打开此抽屉不切换的问题
    setDrawerProps({ visible: true });
    nextTick(() => closeDrawer());
  });

  async function registerForm(formAction: FormActionType, formModel) {
    registerFormOrigin(formAction);
    await updateThemeSchema();
    await setFieldsValue(props.model);
    watch(
      () => props.model,
      () => setFieldsValue(props.model),
    );
    watch(formModel, onModelUpdate, { immediate: true });
  }

  function onModelUpdate(model: Recordable) {
    // 不是 all，则指定皮肤
    model.themeSet = model.theme !== 'all';
    emit('update:model', model);
  }

  // 指定皮肤变化
  async function updateThemeSchema() {
    let lastTheme = [];
    await updateSchema({
      field: 'themeSet',
      componentProps: {
        onChange(themeSet) {
          if (themeSet) {
            if (Array.isArray(lastTheme) && lastTheme.length > 0) {
              setFieldsValue({ theme: lastTheme });
            } else {
              setFieldsValue({ theme: ['default'] });
            }
          } else {
            lastTheme = getFieldsValue().theme;
            setFieldsValue({ theme: 'all' });
          }
        },
      },
    });
    watch(
      () => props.themeNames,
      (names) => {
        if (!Array.isArray(names)) {
          names = [];
        }
        if (names.length === 0) {
          names = ['default'];
        }
        let options = names.map((name) => ({ label: name, value: name }));
        updateSchema([
          { field: 'theme', componentProps: { options } },
          { field: 'themeExclude', componentProps: { options } },
        ]);
      },
      { deep: true, immediate: true },
    );
  }
</script>

<style scoped></style>
