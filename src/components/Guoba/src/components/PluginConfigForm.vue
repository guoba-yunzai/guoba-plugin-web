<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" />
  </a-spin>
</template>

<script lang="ts">
  import type { Plugin } from '/#/guoba';
  import type { FormSchemas } from '/@/components/Form';
  import { BasicForm, useForm } from '/@/components/Form';
  import { computed, defineComponent, PropType, ref } from 'vue';
  import lodash from 'lodash-es';
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
      // 是否启用软分组，即通过分组字段进行分组
      softGrouping: {
        type: Boolean,
        default: false,
      },
      // （v-model） 如果启用软分组，指定默认激活的分组
      activeGroupKey: {
        type: String,
        default: 'default',
      },
      // （v-model） 如果启用软分组，用于获取所有分组的列表
      softGroupList: {
        type: Array as PropType<{ name: string; title: string }[]>,
        default: () => [],
      },
    },
    emits: ['register', 'update:activeGroupKey', 'update:softGroupList'],
    setup(props, { emit }) {
      const { createMessage: $message, createErrorModal } = useMessage();

      const loading = ref(false);

      type SoftGroupItem = {
        name: string;
        title?: string;
        count: number;
      };

      let initGroupKey = '';
      const defGroupKey = 'default';
      const softGroupMap = new Map<string, SoftGroupItem>();

      const schemas = initSchemas();

      const [registerForm, { setFieldsValue, validate }] = useForm({
        labelWidth: 120,
        schemas: schemas,
        labelAlign: 'right',
        showActionButtonGroup: false,
        baseColProps: { span: 24 },
      });

      function initSchemas(): FormSchemas {
        if (!props.softGrouping) {
          return props.plugin.schemas;
        }
        softGroupMap.clear();
        // 启用软分组 分组规则：
        // 1. 遍历 schemas，找到所有的 group 标记字段（component = 'SOFT_GROUP_BEGIN'）
        // 2. 以 group 字段为起点，找到下一个 group 标记字段之间的字段，作为一个分组
        //    若没有找到下一个 group 字段，则直到遍历结束的字段，作为一个分组
        // 3. 重复 1-2 步骤，直到遍历完所有字段
        const schemas = lodash.cloneDeep(props.plugin.schemas);
        const genIfShowFn = (groupKey: string) => () => props.activeGroupKey === groupKey;
        const active = { name: defGroupKey, show: genIfShowFn(defGroupKey) };

        softGroupMap.set(active.name, { name: active.name, title: '默认', count: 0 });
        for (const schema of schemas) {
          if (schema.component === 'SOFT_GROUP_BEGIN') {
          // if (schema.component === 'Divider') {
            schema.ifShow = false;
            active.name = schema.label as string;
            active.show = genIfShowFn(active.name);
            continue;
          }
          if (typeof schema.show === 'function') {
            const oldShow = schema.show;
            schema.show = (...args) => active.show() && oldShow(...args);
          } else {
            schema.show = active.show;
          }
          const group = softGroupMap.get(active.name) || { name: active.name, count: 0 };
          group.count++;
          softGroupMap.set(active.name, group);
        }
        // 去除所有的空分组
        let groupKeys = Array.from(softGroupMap.keys());
        for (const key of groupKeys) {
          if (!softGroupMap.get(key)?.count) {
            softGroupMap.delete(key);
          }
        }
        groupKeys = Array.from(softGroupMap.keys());
        // 当仅有一个分组时，不显示分组
        if (groupKeys.length == 1) {
          return props.plugin.schemas;
        }
        // 获取激活的分组
        let activeGroup = softGroupMap.get(props.activeGroupKey);
        if (!activeGroup?.count) {
          initGroupKey = groupKeys[0];
          emit('update:activeGroupKey', initGroupKey);
        }
        const softGroupList: { name: string; title: string }[] = [];
        Array.from(softGroupMap.entries()).forEach(([key, value]) =>
          softGroupList.push({
            name: key,
            title: value.title || key,
          }),
        );
        emit('update:softGroupList', softGroupList);
        return schemas;
      }

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
