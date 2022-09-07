<template>
  <Modal
    v-model:visible="visible"
    @cancel="closeModal"
    width="460px"
    :closable="false"
    :footer="null">
    <template #title>
      <div ref="modalTitleRef" style="width: 100%; cursor: move">
        选择图标
        <span class="tip">按住这里可拖动</span>
      </div>
    </template>

    <template #modalRender="{ originVNode }">
      <div :style="transformStyle">
        <component :is="originVNode"/>
      </div>
    </template>
    <div class="icon-view-wrap">
      <div class="icon-view">
        <div :class="edit?'edit-icon':'medium-icon'"
             v-for="(_,k) in new Array(100).toString().split(',')"
             :style="{
              background: `url(${iconB64List[k+1]}) 0 0 no-repeat`,
              backgroundSize: '50px 50px'
              }"
             @click="clickIcon(k)"
        />

        <div class="add-icon">
          <a-button :type="edit?'danger':'success'" @click="switchEdit">{{edit?"完成":"添加自定义图标"}}
          </a-button>
        </div>
      </div>
    </div>
  </Modal>

  <IconUploader
    :uploader="uploader"
    v-model:iconB64List="iconB64List"
  />

</template>

<script lang="ts" setup>
  import {defineEmits, ref, watch, watchEffect, computed, CSSProperties} from "vue"
  import {useDraggable} from '@vueuse/core';
  import {Modal, message} from 'ant-design-vue';
  import {listItemType} from "/@/views/guoba/plugins/extra-config/miao-plugin/types";
  import IconUploader from "./IconUploader.vue"

  const props = defineProps({
    visible: Boolean,
    cell: Object as PropType<listItemType>,
    iconB64List: Array as PropType<string[]>,
  });

  const emits = defineEmits([
    "update:visible"
  ])

  const edit = ref<boolean>(false)

  const uploader = ref({
    show: false,
    selected: null
  })

  const closeModal = () => {
    emits("update:visible", false)
  }
  const switchEdit = () => {
    edit.value = !edit.value
    if (edit.value) {
      message.info('请点击想要替换的图标');
    }
  }

  const clickIcon = k => {
    if (!edit.value) {
      props.cell!.icon = k + 1
      emits("update:visible", false)
    } else {
      uploader.value.show = true
      uploader.value.selected = k + 1
    }
  }
  const modalTitleRef = ref<HTMLElement>(null);

  const {x, y, isDragging} = useDraggable(modalTitleRef);
  const startX = ref<number>(0);
  const startY = ref<number>(0);
  const startedDrag = ref(false);
  const transformX = ref(0);
  const transformY = ref(0);
  const preTransformX = ref(0);
  const preTransformY = ref(0);
  const dragRect = ref({left: 0, right: 0, top: 0, bottom: 0});

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
      transformX.value =
        preTransformX.value +
        Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
        startX.value;
      transformY.value =
        preTransformY.value +
        Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
        startY.value;
    }
  });

  const transformStyle = computed<CSSProperties>(() => {
    return {
      transform: `translate(${transformX.value}px, ${transformY.value}px)`,
    };
  });
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
    width: 440px;
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

  .medium-icon, .edit-icon {
    width: 40px;
    height: 40px;
    display: block;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
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
