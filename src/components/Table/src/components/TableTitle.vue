<template>
  <BasicTitle :class="prefixCls" v-if="getTitle" :helpMessage="helpMessage">
    <template v-if="getTitle.isJsx">
      <component :is="getTitle.title" />
    </template>
    <template v-else>
      {{ getTitle.title }}
    </template>
  </BasicTitle>
</template>
<script lang="ts">
  import { computed, defineComponent, PropType } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { isFunction } from '/@/utils/is';

  export default defineComponent({
    name: 'BasicTableTitle',
    components: { BasicTitle },
    props: {
      title: {
        type: [Function, String, Object] as PropType<string | ((data: Recordable) => string | JSX.Element)>,
      },
      getSelectRows: {
        type: Function as PropType<() => Recordable[]>,
      },
      helpMessage: {
        type: [String, Array] as PropType<string | string[]>,
      },
    },
    setup(props) {
      const { prefixCls } = useDesign('basic-table-title');

      const getTitle = computed(() => {
        const { title, getSelectRows = () => {} } = props;
        let tit: string | JSX.Element | ((data: Recordable) => string | JSX.Element) = title!;

        if (isFunction(title)) {
          tit = title({
            selectRows: getSelectRows(),
          });
        }
        // 判断是否是JSX
        let isJsx = typeof tit !== 'string';

        return {
          title: tit,
          isJsx,
        };
      });

      return { getTitle, prefixCls };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-basic-table-title';

  .@{prefix-cls} {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
