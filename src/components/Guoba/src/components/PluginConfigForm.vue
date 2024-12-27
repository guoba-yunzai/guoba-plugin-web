<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" />
  </a-spin>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import type { Plugin } from '/#/guoba';
  import { ref, computed, defineComponent } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { defHttp } from '/@/utils/http/axios';
  import { useMessage } from '/@/hooks/web/useMessage';

  export default defineComponent({
    name: 'PluginConfigForm',
    components: { BasicForm },
    props: {
      plugin: {
        type: Object as PropType<Plugin>,
        required: true,
      },
    },
    setup(props) {
      const loading = ref(false);

      const { createMessage: $message, createErrorModal } = useMessage();

      const [registerForm, { setFieldsValue, validate }] = useForm({
        labelWidth: 120,
        schemas: props.plugin.schemas,
        labelAlign: 'right',
        showActionButtonGroup: false,
        baseColProps: { span: 24 },
      });

      const url = computed(() => `/plugin/s/${props.plugin.name}/config`);

      // 获取插件配置数据
      async function getPluginConfigData() {
        try {
          loading.value = true;
          let result = await defHttp.get({ url: url.value }, { errorMessageMode: 'modal' });
          await setFieldsValue(result);
        } finally {
          loading.value = false;
        }
      }

      async function savePluginConfigData() {
        let values = await validate();
        let { ok, message } = await defHttp.put(
          { url: url.value, params: values },
          {
            trimValues: false,
            isTransformResponse: false,
          },
        );
        if (ok) {
          $message.success(message || '保存成功！');
          await getPluginConfigData();
        } else {
          createErrorModal({ title: '错误', content: message || '保存失败！' });
        }
      }

      return {
        registerForm: (...args) => {
          // @ts-ignored
          registerForm(...args);
          getPluginConfigData();
        },
        loading,
        savePluginConfigData,
      };
    },
  });
</script>

<style scoped></style>
