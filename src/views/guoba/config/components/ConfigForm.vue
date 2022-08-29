<template>
  <div>
    <template v-for="(card, idx) of cards" :key="card.key">
      <template v-if="card.type === 'keyFormCard'">
        <template v-for="keyForm of keyForms[card.key]">
          <CardForm
            :card="card"
            :form="keyForm"
            :allowFold="keyForm.key!=='default'"
            defaultFold
            @redo="onRedo"
            @submit="onSubmit"
          />
        </template>
      </template>
      <template v-else-if="card.type === 'arrayFormCard'">
        <ArrayForm
          :card="card"
          :form="forms[idx]"
          :value="arrayForms[card.key]"
          @redo="onRedo"
          @submit="onSubmit"
        />
      </template>
      <CardForm v-else :card="card" :form="forms[idx]" @redo="onRedo" @submit="onSubmit"/>
    </template>
  </div>
</template>
<script lang="ts">
  import type { PropType } from 'vue'
  import type { ConfigCards, IConfigCard, FormsType, FormType } from '../types'
  import { defineComponent, onMounted, ref, nextTick } from 'vue'
  import { useForm } from '/@/components/Form'
  import { propTypes } from '/@/utils/propTypes'
  import { useMessage } from '/@/hooks/web/useMessage'
  import { ScrollContainer } from '/@/components/Container'
  import { queryConfigData, saveConfigData } from '../config.api'
  import CardForm from './CardForm.vue'
  import ArrayForm from './ArrayForm.vue'

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
      const { createMessage } = useMessage()
      const keyForms = ref<Record<string, FormsType>>({})
      const arrayForms = ref<Record<string, FormsType>>({})
      const forms = ref<FormsType>(props.cards!.map(useCardForm))

      function useCardForm(card: IConfigCard): FormType {
        if (card.type === 'keyFormCard') {
          keyForms.value[card.key] = []
          return { key: card.key, loading: false, isKeyForm: true, card }
        }
        if (card.type === 'arrayFormCard') {
          arrayForms.value[card.key] = []
          return { key: card.key, loading: false, isArrayForm: true, card }
        }
        return useNormalForm(card)
      }

      onMounted(() => {
        for (let form of forms.value) {
          onRedo(form)
        }
      })

      function useNormalForm(card, other?): FormType {
        const [register, actions] = useForm({
          labelWidth: 120,
          schemas: card.schemas,
          labelAlign: 'right',
          showActionButtonGroup: false,
          baseColProps: { span: 24 },
        })
        return { key: card.key, loading: false, register, actions, ...other }
      }

      async function onRedo(form: FormType) {
        try {
          form.loading = true
          let configKey = form.key
          if (form.isKeyForm) {
            configKey = form.card.key
          }
          let values = await queryConfigData(configKey)
          if (form.isKeyForm) {
            let keys = Object.keys(values)
            keyForms.value[form.key] = keys.map(key => {
              let fieldKey = key
              let keyForm = useNormalForm({
                key: key.replace(/^INTEGER__/, ''),
                schemas: form.card.schemas.map(s => {
                  return {
                    ...s,
                    field: fieldKey + '.' + s.field,
                  }
                }),
              }, { isKeyForm: form.isKeyForm, card: form.card })
              let _register = keyForm.register!
              keyForm.register = function (...args) {
                _register(...args)
                nextTick(() => {
                  let formValues: Recordable = {}
                  for (const [fKey, value] of Object.entries(values)) {
                    if (fKey === key) {
                      formValues[fieldKey] = value
                      break
                    }
                  }
                  keyForm.actions?.setFieldsValue(formValues)
                })
              } as typeof _register
              return keyForm
            }).sort((a, b) => {
              if (a.key === 'default') {
                return -1
              }
              return a.key.localeCompare(b.key)
            })
          } else if (form.isArrayForm) {
            arrayForms.value[form.key] = values
          } else {
            await form.actions?.setFieldsValue(values)
          }
        } finally {
          form.loading = false
        }
      }

      async function onSubmit(form: FormType) {
        try {
          form.loading = true
          let values = await form.actions?.validate()
          let configKey = form.key
          if (form.isKeyForm) {
            configKey = form.card.key
            // 处理 keyForm
            let entries = Object.entries(values)
            values = {}
            for (let [field, value] of entries) {
              let [pKey, cKey] = field.split('.')
              if (!values[pKey]) {
                values[pKey] = {}
              }
              values[pKey][cKey] = value
            }
          }
          await saveConfigData(configKey, values)
          createMessage.success('保存成功~')
          await onRedo(form)
        } finally {
          form.loading = false
        }
      }

      return {
        forms,
        keyForms,
        arrayForms,
        onRedo,
        onSubmit,
      }
    },
  })
</script>

<style lang="less" scoped>

</style>
