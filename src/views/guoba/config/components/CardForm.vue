<template>
  <a-card :class="[prefixCls, { 'allow-fold': allowFold, folded }]" :bordered="false">
    <template #title>
      <div class="card-title" @click="onClickTitle">
        <span>{{ cardTitle }}</span>
        <span v-if="allowFold" style="margin-left: 8px">
          <icon v-if="folded" icon="ant-design:caret-down" />
          <icon v-else icon="ant-design:caret-up" />
        </span>
      </div>
    </template>

    <template #extra>
      <a-tooltip title="刷新">
        <icon icon="ant-design:redo" style="cursor: pointer" @click="() => emit('redo', form)" />
      </a-tooltip>
    </template>

    <a-spin :spinning="form.loading">
      <BasicForm @register="form.register" />
      <div style="text-align: center">
        <a-button type="primary" pre-icon="ant-design:save" @click="() => emit('submit', form)">
          <span>保存</span>
        </a-button>
        <template v-if="isDefault">
          <a-divider type="vertical" />
          <a-button v-if="card.allowAdd" pre-icon="ant-design:plus" @click="onAddCard">
            <span>{{ card.addBtnText ?? '新增' }}</span>
          </a-button>
        </template>
      </div>
    </a-spin>
  </a-card>
</template>

<script lang="ts">
  import type { PropType } from 'vue';
  import { computed, defineComponent, ref } from 'vue';
  import type { IConfigCard, FormType } from '../types';
  import { propTypes } from '/@/utils/propTypes';
  import { BasicForm } from '/@/components/Form';
  import { useDesign } from '/@/hooks/web/useDesign';

  export default defineComponent({
    name: 'CardForm',
    components: { BasicForm },
    props: {
      card: propTypes.object.isRequired.type as PropType<IConfigCard>,
      form: propTypes.object.isRequired.type as PropType<FormType>,
      isDefault: propTypes.bool.def(false),
      // 允许折叠
      allowFold: propTypes.bool.def(false),
      // 默认折叠
      defaultFold: propTypes.bool.def(false),
    },
    emits: ['redo', 'submit'],
    setup(props, { emit }) {
      const { prefixCls } = useDesign('card-form');
      const folded = ref<boolean>(!!props.defaultFold);

      const cardTitle = computed(() => {
        // if (props.form!.key === 'default') {
        //   return '默认配置'
        // }
        return decodeTitle(props.card!, props.form!);
      });

      function decodeTitle(card: IConfigCard, form: FormType) {
        return card.title.replace(/{{([^}]+)}}/g, (_, $1) => {
          return new Function('card', 'form', `return ${$1}`)(card, form);
        });
      }

      function onClickTitle() {
        if (props.allowFold) {
          folded.value = !folded.value;
        }
      }

      function onAddCard() {}

      return {
        emit,
        prefixCls,
        folded,
        cardTitle,
        onClickTitle,
        onAddCard,
      };
    },
  });
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-card-form';

  .@{prefix-cls} {
    margin-bottom: 12px;

    .ant-card-head-title {
      padding: 0;
    }

    .card-title {
      padding: 16px 0;
    }
  }

  .@{prefix-cls}.allow-fold {
    .card-title {
      cursor: pointer;
    }

    &.folded {
      .ant-card-body {
        display: none;
      }
    }
  }
</style>
