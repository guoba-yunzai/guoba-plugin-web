<template>
  <BasicModal @register="registerModal" title="Cron表达式" width="800px" destroyOnClose @ok="onOk">
    <EasyCron v-bind="attrs" />
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import EasyCron from './EasyCronInner.vue';

  export default defineComponent({
    name: 'EasyCronModal',
    inheritAttrs: false,
    components: { BasicModal, EasyCron },
    emits: ['register', 'ok'],
    setup(_, { emit }) {
      const attrs = useAttrs();
      const [registerModal, { closeModal }] = useModalInner();

      function onOk() {
        closeModal();
        emit('ok');
      }

      return { attrs, registerModal, onOk };
    },
  });
</script>
