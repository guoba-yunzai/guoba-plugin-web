<template>
  <div>
    <template v-for="(card, idx) of cards" :key="card.key">
      <template v-if="card.type === 'keyFormCard'">
        <template v-for="keyForm of keyForms[card.key]" :key="keyForm.key">
          <CardForm
            :card="card"
            :form="keyForm"
            :isDefault="keyForm.key === 'default'"
            :allowFold="keyForm.key !== 'default'"
            defaultFold
            @redo="onRedo"
            @submit="onSubmit"
            @addCard="onAddCard"
            @delCard="onDelCard"
          />
        </template>
      </template>
      <template v-else-if="card.type === 'arrayFormCard'">
        <ArrayForm :card="card" :form="forms[idx]" :value="arrayForms[card.key]" @redo="onRedo" @submit="onSubmit" />
      </template>
      <CardForm v-else :card="card" :form="forms[idx]" @redo="onRedo" @submit="onSubmit" />
    </template>
  </div>
</template>
<script lang="ts">
  import type { PropType } from 'vue';
  import { defineComponent, onMounted, ref, nextTick } from 'vue';
  import type { ConfigCards, IConfigCard, FormsType, FormType } from '../types';
  import { useForm } from '/@/components/Form';
  import { propTypes } from '/@/utils/propTypes';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ScrollContainer } from '/@/components/Container';
  import { queryConfigData, saveConfigData, removeCardForm } from '../config.api';
  import CardForm from './CardForm.vue';
  import ArrayForm from './ArrayForm.vue';

  export default defineComponent({
    name: 'ConfigForm',
    components: {
      ArrayForm,
      CardForm,
      ScrollContainer,
    },
    props: {
      cards: propTypes.object.isRequired.type as PropType<ConfigCards>,
    },
    setup(props) {
      const { createMessage } = useMessage();
      const keyForms = ref<Record<string, FormsType>>({});
      const arrayForms = ref<Record<string, FormsType>>({});
      const forms = ref<FormsType>(props.cards!.map(useCardForm));

      function useCardForm(card: IConfigCard): FormType {
        if (card.type === 'keyFormCard') {
          keyForms.value[card.key] = [];
          return { key: card.key, loading: false, isKeyForm: true, card };
        }
        if (card.type === 'arrayFormCard') {
          arrayForms.value[card.key] = [];
          return { key: card.key, loading: false, isArrayForm: true, card };
        }
        return useNormalForm(card);
      }

      onMounted(() => {
        for (let form of forms.value) {
          onRedo(form);
        }
      });

      function useNormalForm(card: any, other?): FormType {
        const [register, actions] = useForm({
          labelWidth: 120,
          schemas: card.schemas,
          labelAlign: 'right',
          showActionButtonGroup: false,
          baseColProps: { span: 24 },
        });
        return { key: card.key, loading: false, register, actions, ...other };
      }

      async function onRedo(form: FormType) {
        try {
          form.loading = true;
          let configKey = form.key;
          if (form.isKeyForm) {
            configKey = form.card.key;
          }
          let values = await queryConfigData(configKey);
          if (form.isKeyForm) {
            let replaceFn = (s) => s.replace(/^INTEGER__/, '');
            let keys = Object.keys(values);
            let oldKeys: string[] = [];
            let newKeys: string[] = [];
            let removeKeys: string[] = [];
            let forms = keyForms.value[form.card.key] ?? [];
            keys.forEach((k) => {
              // 如果keys中有，但是forms中没有，说明是新增
              if (!forms.find((f) => f.key === replaceFn(k))) {
                newKeys.push(k);
              }
            });
            // 如果forms中有，但是keys中没有，说明是删除
            forms.forEach((f) => {
              if (!keys.find((k) => replaceFn(k) === f.key)) {
                removeKeys.push(f.key);
              }
            });
            // 既不是新增，也不是删除，就是老数据
            oldKeys = keys.filter((k) => !newKeys.includes(k) && !removeKeys.includes(k));
            let setFormValue = (form: FormType, fieldKey) => {
              let formValues: Recordable = {};
              for (const [fKey, value] of Object.entries(values)) {
                if (fKey === fieldKey) {
                  formValues[fieldKey] = value;
                  break;
                }
              }
              form.actions?.setFieldsValue(formValues);
            };
            // console.log({ keys, newKeys, removeKeys, oldKeys });
            let newForm = newKeys.map((key) => {
              let fieldKey = key;
              let keyForm = useNormalForm(
                {
                  key: replaceFn(key),
                  schemas: form.card.schemas.map((s) => {
                    return {
                      ...s,
                      field: fieldKey + '.' + s.field,
                    };
                  }),
                },
                { fieldKey, isKeyForm: form.isKeyForm, card: form.card },
              );
              let _register = keyForm.register!;
              keyForm.register = function (...args) {
                _register(...args);
                nextTick(() => setFormValue(keyForm, fieldKey));
              } as typeof _register;
              return keyForm;
            });
            let sortFn = (i) => (a, b) => {
              if (a.key === 'default') {
                return i;
              }
              return a.key.localeCompare(b.key);
            };
            forms = forms.concat(newForm).filter((f) => !removeKeys.includes(f.key));
            forms = forms.sort(sortFn(1)).sort(sortFn(-1));
            // 老数据直接赋值
            forms.forEach((f) => {
              for (const fieldKey of oldKeys) {
                if (replaceFn(fieldKey) === f.key) {
                  nextTick(() => setFormValue(f, fieldKey));
                  break;
                }
              }
            });
            keyForms.value[form.card.key] = forms;
          } else if (form.isArrayForm) {
            arrayForms.value[form.key] = values;
          } else {
            await form.actions?.setFieldsValue(values);
          }
        } finally {
          form.loading = false;
        }
      }

      async function onSubmit(form: FormType) {
        try {
          form.loading = true;
          let values = await form.actions?.validate();
          let configKey = form.key;
          if (form.isKeyForm) {
            configKey = form.card.key;
            // 处理 keyForm
            let entries = Object.entries(values);
            values = {};
            for (let [field, value] of entries) {
              if (field.includes('.')) {
                let [pKey, cKey] = field.split('.');
                if (!values[pKey]) {
                  values[pKey] = {};
                }
                values[pKey][cKey] = value;
              } else {
                values[field] = value;
              }
            }
          }
          await saveConfigData(configKey, values);
          createMessage.success('保存成功~');
          await onRedo(form);
        } finally {
          form.loading = false;
        }
      }

      async function onAddCard({ form, key }: { form: FormType; key: string }) {
        let isExist = keyForms.value[form.card.key].findIndex((f) => f.key === key) > -1;
        if (isExist) {
          createMessage.warn('已存在相同的配置');
          return false;
        }
        await onSubmit({
          ...form,
          key: key,
          // @ts-ignored
          actions: {
            ...form.actions,
            validate: async () => ({ ['INTEGER__' + key]: { __place__: 0 } }),
          },
        });
      }

      async function onDelCard({ form }: { form: FormType }) {
        try {
          form.loading = true;
          let formKey = form.fieldKey!;
          let cardKey = form.card.key;
          await removeCardForm(formKey, cardKey);
          createMessage.success('删除成功~');
          await onRedo(form);
        } finally {
          form.loading = false;
        }
      }

      return {
        forms,
        keyForms,
        arrayForms,
        onRedo,
        onSubmit,
        onAddCard,
        onDelCard,
      };
    },
  });
</script>

<style lang="less" scoped></style>
