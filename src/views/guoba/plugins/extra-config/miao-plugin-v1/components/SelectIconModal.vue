<template>
  <Modal :visible="visible" @cancel="closeModal" width="420px" :closable="false" :footer="null" :mask="false" @update:visible="emits('update:visible', $event)">
    <template #title>
      <div ref="modalTitleRef" style="width: 100%; cursor: move">
        选择图标
        <span class="tip">按住这里可拖动</span>
      </div>
    </template>

    <template #modalRender="{ originVNode }">
      <div :style="transformStyle">
        <component :is="originVNode" />
      </div>
    </template>
    <div class="icon-view-wrap">
      <div class="icon-view">
        <div
          :class="edit ? 'edit-icon' : 'medium-icon'"
          v-for="(_, idx) of new Array(iconB64List.length - 1).toString().split(',')"
          :style="{
            background: `url(${iconB64List[idx + 1]}) 0 0 no-repeat`,
            backgroundSize: '50px 50px',
          }"
          @click="clickIcon(idx)"
        />

        <a-space class="add-icon" style="padding: 10px; width: 100%">
          <a-button :type="edit ? 'danger' : 'success'" @click="switchEdit">{{ edit ? '完成' : '替换图标' }}</a-button>
          <a-button type="primary" @click="addLine">添加10个空图标</a-button>
        </a-space>
      </div>
    </div>
  </Modal>

  <IconUploader :uploader="uploader" :iconB64List="iconB64List" />
</template>

<script lang="ts" setup>
  import { defineEmits, ref, watch, watchEffect, computed, CSSProperties } from 'vue';
  import { useDraggable } from '@vueuse/core';
  import { Modal, message } from 'ant-design-vue';
  import { listItemType } from '/@/views/guoba/plugins/extra-config/miao-plugin/types';
  import IconUploader from './IconUploader.vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  const props = defineProps({
    visible: Boolean,
    cell: Object as PropType<listItemType>,
    iconB64List: Array as PropType<string[]>,
  });

  const emits = defineEmits(['update:visible']);

  const { createMessage: $message } = useMessage();

  const edit = ref<boolean>(false);

  const uploader = ref({
    show: false,
    selected: null,
  });

  const closeModal = () => {
    emits('update:visible', false);
  };
  const switchEdit = () => {
    edit.value = !edit.value;
    if (edit.value) {
      message.info('请点击想要替换的图标');
    }
  };

  const clickIcon = (k) => {
    if (!edit.value) {
      props.cell!.icon = k + 1;
      emits('update:visible', false);
    } else {
      uploader.value.show = true;
      uploader.value.selected = k + 1;
    }
  };
  const modalTitleRef = ref<HTMLElement>(null);

  const { x, y, isDragging } = useDraggable(modalTitleRef);
  const startX = ref<number>(0);
  const startY = ref<number>(0);
  const startedDrag = ref(false);
  const transformX = ref(0);
  const transformY = ref(0);
  const preTransformX = ref(0);
  const preTransformY = ref(0);
  const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });

  watch([x, y], () => {
    if (!startedDrag.value) {
      startX.value = x.value;
      startY.value = y.value;
      const bodyRect = document.body.getBoundingClientRect();
      const titleRect = modalTitleRef.value.getBoundingClientRect();
      dragRect.value.right = bodyRect.width - titleRect.width;
      dragRect.value.bottom = bodyRect.height - titleRect.height;
      preTransformX.value = transformX.value;
      preTransformY.value = transformY.value;
    }
    startedDrag.value = true;
  });

  watch(isDragging, () => {
    if (!isDragging) {
      startedDrag.value = false;
    }
  });

  watchEffect(() => {
    if (startedDrag.value) {
      transformX.value = preTransformX.value + Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) - startX.value;
      transformY.value = preTransformY.value + Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) - startY.value;
    }
  });

  const transformStyle = computed<CSSProperties>(() => {
    return {
      transform: `translate(${transformX.value}px, ${transformY.value}px)`,
    };
  });

  function addLine() {
    let iconB64List = props.iconB64List!;
    let flag = false;
    for (let i = 1; i < iconB64List.length; i++) {
      if (!iconB64List[i]) {
        flag = true;
        break;
      }
    }
    if (flag) {
      $message.warn('仍有未利用的空白图标，无法继续添加');
      return;
    }
    iconB64List.push(...Array(10).fill(''));
  }
</script>

<style scoped>
  .add-icon {
    flex-grow: 1;
    display: flex;
    flex-direction: row-reverse;
  }

  .tip {
    font-size: 12px;
    color: #888;
  }

  .icon-view-wrap {
    width: 410px;
    max-width: calc(100vw - 52px);
    margin: 10px;
    z-index: 100;
  }

  .icon-view {
    display: flex;
    justify-content: left;
    flex-wrap: wrap;
    align-items: center;
  }

  .medium-icon,
  .edit-icon {
    width: 40px;
    height: 40px;
    display: block;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .edit-icon {
    box-shadow: 2px 2px 8px -4px #4ebaee;
  }

  .medium-icon:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px #4ebaee;
  }

  .edit-icon:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px red;
  }
</style>
