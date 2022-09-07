<template>
  <Modal
    v-model:visible="modelData.show"
    :closable="false"
    :footer="null">
    <template #title>
      <div  ref="modalTitleRef" style="width: 100%; cursor: move;margin: 0">
        编辑内容
        <span class="tip">按住这里可拖动</span>
      </div>
    </template>

    <template #modalRender="{ originVNode }">
      <div :style="transformStyle">
        <component :is="originVNode"/>
      </div>
    </template>

    <div class="p-4">
      <div class="row">
        <div>分组</div>
        <div class="flex-1">
          <a-input v-model:value="modelData.group.group" placeholder="分组"/>
        </div>
      </div>

      <div class="row">
        <div>仅主人</div>
        <Switch
          v-model:checked="modelData.group.auth"
          checkedValue="master"
          checked-children="是"
          un-checked-children="否"
        />
      </div>

      <div class="flex justify-between align-center flex-wrap">
        <div class="flex justify-start">
          <a-button
            class="ml-4"
            :disabled="modelData.groupIndex===0"
            type="primary"
            shape="circle"
            size="medium"
            @click="moveGroup(-1)">
            <Icon icon="akar-icons:arrow-up"/>
          </a-button>

          <a-button
            class="ml-4"
            :disabled="modelData.groupIndex===helpList.length-1"
            type="primary"
            shape="circle"
            size="medium"
            @click="moveGroup(1)">
            <Icon icon="akar-icons:arrow-down"/>
          </a-button>
        </div>
        <div class="flex flex-1 justify-end">
          <a-button v-if="!modelData.cell" class="ml-4" @click="createCell">添加项目
          </a-button>
          <a-button class="ml-4" type="success" @click="createGroup">添加分组</a-button>
          <a-popconfirm title="确定删除？" @confirm="deleteGroup">
            <a-button class="ml-4" type="default" danger>删除该组</a-button>
          </a-popconfirm>
        </div>
      </div>

      <div v-if="modelData.cell">
        <a-divider style="margin:16px 0"/>

        <div class="icon"
             @click="changeIcon"
             :style="`background: url(${iconB64List[modelData.cell.icon]}) 0 0 no-repeat`"/>

        <div class="row">
          <div>标题</div>
          <div class="flex-1">
            <a-input v-model:value="modelData.cell.title" placeholder="标题"/>
          </div>
        </div>

        <div class="row">
          <div>描述</div>
          <div class="flex-1">
            <a-input v-model:value="modelData.cell.desc" placeholder="描述"/>
          </div>
        </div>

        <div class="flex justify-between align-center">
          <div class="flex justify-start">
            <a-button
              class="ml-4"
              :disabled="modelData.cellIndex===0"
              type="primary"
              shape="circle"
              size="medium"
              @click="moveCell(-1)">
              <Icon icon="akar-icons:arrow-left"/>
            </a-button>

            <a-button
              class="ml-4"
              :disabled="modelData.cellIndex===helpList[modelData.groupIndex].list.length-1"
              type="primary"
              shape="circle"
              size="medium"
              @click="moveCell(1)">
              <Icon icon="akar-icons:arrow-right"/>
            </a-button>
          </div>
          <div class="flex flex-1 justify-end">
            <a-button class="ml-4" type="success" @click="createCell">添加项目</a-button>
            <a-popconfirm title="确定删除？" @confirm="deleteCell">
              <a-button class="ml-4" type="default" danger>删除该项</a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>
    </div>
  </Modal>

  <SelectIconModal
    v-if="modelData.cell"
    v-model:visible="showIconModal"
    v-model:cell="modelData.cell"
    v-model:iconB64List="iconB64List"
  />
</template>

<script lang="ts" setup>
  import {ref, watch, watchEffect, computed, CSSProperties} from "vue"
  import {useDraggable} from '@vueuse/core';
  import {Modal, Switch} from 'ant-design-vue';
  import {helpListType, modelDataType} from "../types";
  import SelectIconModal from "./SelectIconModal.vue"

  const props = defineProps({
    helpList: Object as PropType<helpListType>,
    modelData: Object as PropType<modelDataType>,
    iconB64List: Array as PropType<string[]>,
  });

  const showIconModal = ref<boolean>(false)


  const createGroup = () => {
    let index = props.modelData!.groupIndex!
    props.helpList!.splice(index, 0, {
      group: "未命名组别",
      list: []
    })
    props.modelData!.group = props.helpList![index]
    props.modelData!.cellIndex = props.modelData!.cell = null
  }

  const createCell = () => {
    let index = props.modelData!.cellIndex ?? 0
    props.helpList![props.modelData!.groupIndex!].list.splice(index, 0, {
      icon: 1,
      title: "未命名项目",
      desc: "请添加描述"
    })
    props.modelData!.cell = props.helpList![props.modelData!.groupIndex!].list[index]
    props.modelData!.cellIndex = index
  }

  const moveGroup = offset => {
    let temp, array = props.helpList!, index = props.modelData!.groupIndex!
    temp = array[index]
    array[index] = array[index + offset]
    array[index + offset] = temp
    props.modelData!.groupIndex! += offset
  }

  const moveCell = offset => {
    let temp, array = props.helpList![props.modelData!.groupIndex!].list,
      index = props.modelData!.cellIndex!
    temp = array[index]
    array[index] = array[index + offset]
    array[index + offset] = temp
    props.modelData!.cellIndex! += offset
  }

  const deleteGroup = () => {
    props.helpList!.splice(props.modelData!.groupIndex!, 1)
    props.modelData!.show = false
  }

  const deleteCell = () => {
    props.helpList![props.modelData!.groupIndex!].list.splice(props.modelData!.cellIndex!, 1);
    props.modelData!.show = false
  }

  const changeIcon = () => {
    showIconModal.value = true
  }

  const modalTitleRef = ref<Nullable<HTMLElement>>(null);

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
  .tip {
    font-size: 12px;
    color: #888;
  }

  .icon {
    margin: 0 auto 16px;
    border-radius: 5px;
    width: 80px;
    height: 80px;
    box-shadow: 0 0 15px #f0f1f5;
    transition: all 0.2s;
  }

  .icon:hover {
    cursor: pointer;
    box-shadow: 0 0 15px #4ebaee;
  }

  .row {
    padding-right: 30px;
    padding-bottom: 16px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .row > div:first-child {
    width: 80px;
    display: flex;
    justify-content: flex-end;
  }

  .row > div:first-child:after {
    content: ":";
    margin: 0 6px 0 2px;
    position: relative;
    top: -0.5px;
  }
</style>
