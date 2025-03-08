<template>
  <div :class="[prefixCls]" :style="`transform: scale(${scale});transform-origin: center top;`">
    <div class="container">
      <div class="setting-box">
        <input type="file" id="upload-bg" style="display: none" name="icon" accept="image/bmp,image/jpeg,image/png" />
        <input type="file" id="upload-icon" style="display: none" name="icon" accept="image/png" />
        <!--        <Dropdown :trigger="['click']" :dropMenuList="dropMenuList">-->
        <!--          <a-button-->
        <!--            :style="`transform: scale(${1 / scale});transform-origin: right top;`"-->
        <!--            type="primary"-->
        <!--            shape="circle"-->
        <!--            size="large"-->
        <!--          >-->
        <!--            <Icon icon="akar-icons:image" />-->
        <!--          </a-button>-->
        <!--        </Dropdown>-->
        <a-button :style="`transform: scale(${1 / scale});transform-origin: right top;`" type="primary" shape="circle" size="large" @click="onOpenSetting">
          <Icon icon="ion:settings-outline" />
        </a-button>
      </div>

      <div class="info-box">
        <div class="head-box type">
          <div class="title">{{ helpCfg.title }}</div>
          <div class="label">{{ helpCfg.subTitle }}</div>
        </div>
      </div>

      <div class="cont-box" v-for="(group, groupIndex) in helpList" :key="groupIndex">
        <div class="help-group" @click="clickBody(null, null, group, groupIndex)">
          <span>{{ group.group }}</span>
        </div>
        <HelpTable
          v-if="!!(group.list?.length || 0)"
          :list="group.list"
          :colCount="colCount"
          :iconB64List="iconB64List"
          :modelData="modelData"
          @open="(cell, cellIndex) => clickBody(cell, cellIndex, group, groupIndex)"
        />
      </div>

      <div class="copyright">
        Created By Yunzai-Bot
        <span class="version">{{ versions.yunzai }}</span>
        &amp; Miao-Plugin
        <span class="version">{{ versions.miao }}</span>
      </div>
    </div>

    <EditBodyModal :panelCls="prefixCls" :helpList="helpList" :modelData="modelData" :iconB64List="iconB64List" @update:modelData="emit('update:modelData', $event)" />
    <UploadIconHelpModal @register="registerUihModal" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import EditBodyModal from './EditBodyModal.vue';
  import { helpCfgType, helpListItemType, helpListType, listItemType, ListType, modelDataType, ThemeConfigType } from '../types';
  import lodash from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { createLocalStorage } from '/@/utils/cache';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useModal } from '/@/components/Modal';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { cssExpand } from '/@/utils/common';
  import { getAppEnvConfig } from '/@/utils/env';
  import { useDebounceFn } from '@vueuse/core';
  import { HelpTable } from './HelpComps';
  import UploadIconHelpModal from './UploadIconHelpModal.vue';
  import { getHelpIconList, getThemeConfig } from '../miao.api';

  const { VITE_PUBLIC_PATH } = getAppEnvConfig();
  const props = defineProps({
    helpCfg: Object as PropType<helpCfgType>,
    helpList: Object as PropType<helpListType>,
    bgB64: String,
    mainB64: String,
    cacheVer: Number,
    themeName: String,
    themeNames: Array as PropType<string[]>,
    iconB64List: Array as PropType<string[]>,
    modelData: Object as PropType<modelDataType>,
    themeStyle: Object as PropType<ThemeConfigType>,
    versions: Object as PropType<{ yunzai: string; miao: string }>,
  });

  const emit = defineEmits(['update:themeStyle', 'update:modelData', 'update:mainB64', 'update:iconB64List', 'open-setting']);

  const ls = createLocalStorage();
  const permStore = usePermissionStore();
  const { prefixCls } = useDesign('miao-plugin-help-panel');
  const { createMessage: $message } = useMessage();
  const [registerUihModal, uihModal] = useModal();

  const scale = ref(1);
  const colCount = ref(3);
  const boxWidth = ref(850);

  const watchCfgHandler = () => {
    let config = genThemeConfig();
    if (config.style) {
      cssExpand(config.style, prefixCls);
    }
    boxWidth.value = config.width || 850;
    colCount.value = config.colCount;
  };
  const watchCfgHandlerDebounce = useDebounceFn(watchCfgHandler, 300);

  watch([() => props.helpCfg, () => props.themeName], watchCfgHandlerDebounce, {
    immediate: true,
    deep: true,
  });
  watch(() => props.themeStyle, watchCfgHandler, { immediate: true, deep: true });

  watch(
    boxWidth,
    (width) => {
      if (document.body.clientWidth >= width) {
        scale.value = 1;
      } else {
        scale.value = parseFloat((document.body.clientWidth / width).toFixed(4));
      }
    },
    { immediate: true },
  );

  const dropMenuList = ref<any[]>([
    {
      event: 'changeBackground',
      text: '更换背景',
      icon: 'akar-icons:image',
      onClick() {
        getUploadBase64('upload-bg', (base64) => {
          emit('update:mainB64', base64);
        });
      },
    },
    {
      event: 'uploadIcon',
      text: '上传图标',
      icon: 'fontisto:nav-icon-grid',
      onClick() {
        let fn = () => {
          getUploadBase64('upload-icon', async (base64) => {
            let iconList = await getHelpIconList(base64);
            emit('update:iconB64List', iconList);
            $message.success('上传成功');
          });
        };
        let flag = ls.get('hide-upload-icon-help-modal', false);
        if (flag === true) {
          fn();
        } else {
          uihModal.openModal(true, fn);
        }
      },
    },
  ]);

  watch(
    () => props.themeName,
    async (themeName: string) => {
      emit('update:themeStyle', await getThemeConfig(themeName));
    },
    { immediate: true },
  );

  const isBindEvent = {};

  function getUploadBase64(inputId: string, callback: Fn) {
    let input = document.getElementById(inputId) as HTMLInputElement;
    if (!isBindEvent[inputId]) {
      isBindEvent[inputId] = true;
      input.addEventListener('change', (ev) => {
        let files = (ev.target! as HTMLInputElement).files!;
        if (files.length !== 0) {
          let file = files[0];
          let Reader = new FileReader();
          Reader.readAsDataURL(file);
          Reader.onload = () => {
            callback(Reader.result);
            // @ts-ignore
            input.value = null;
          };
        }
      });
    }
    input.click();
  }

  const clickBody = (cell: listItemType, cellIndex: number, group: helpListItemType, groupIndex: number) => {
    let isShow = true;
    if (props.modelData?.show) {
      if (cell && cell === props.modelData?.cell) {
        isShow = false;
      }
    }
    emit('update:modelData', { show: isShow, cell, cellIndex, group, groupIndex });
  };

  const split = (item_list: ListType) => {
    let result: listItemType[][] = [];
    for (let i = 0; i < item_list.length; i += 3) {
      result.push(item_list.slice(i, i + 3));
    }
    return result;
  };

  function onOpenSetting() {
    emit('open-setting');
    emit('update:modelData', { ...props.modelData, show: false });
  }

  function dataDef(...args: any[]) {
    for (let item of args) {
      if (!lodash.isUndefined(item)) {
        return item;
      }
    }
  }

  function genThemeConfig() {
    let { helpCfg } = props;
    if (!helpCfg) {
      return { style: '', colCount: 3 };
    }
    let colCount = Math.min(5, Math.max(parseInt(helpCfg?.colCount) || 3, 2));
    let colWidth = Math.min(500, Math.max(100, parseInt(helpCfg?.colWidth) || 265));
    let width = Math.min(2500, Math.max(800, colCount * colWidth + 30));
    let ret: string[] = [];
    ret.push(`.${prefixCls} { width:${width}px; }`);
    ret.push(`.${prefixCls} .help-table .td,.help-table .th{width:${100 / colCount}%}`);

    let themePath = `${VITE_PUBLIC_PATH}/api/plugin/miao/help/theme/$s?token=${permStore.liteToken}&themeName=${props.themeName}&_v=${props.cacheVer}`;
    let themeBg = themePath.replace('$s', 'bg');
    let themeMain = themePath.replace('$s', 'main');
    if (props.mainB64) {
      themeMain = props.mainB64;
    }
    let background = `background: url(${themeMain}) top left/100% auto no-repeat,url(${themeBg})`;
    ret.push(`.${prefixCls} .container { width:${width}px; ${background}; }`);

    let css = function (sel: string, css: string, key: string, def: any, fn?: Fn) {
      let val = dataDef(props.themeStyle![key], def);
      if (fn) {
        val = fn(val);
      }
      ret.push(`.${prefixCls} ${sel}{${css}:${val}}`);
    };
    css('.help-title,.help-group', 'color', 'fontColor', '#ceb78b');
    css('.help-title,.help-group', 'text-shadow', 'fontShadow', 'none');
    css('.help-desc', 'color', 'descColor', '#eee');
    css('.help-desc', 'text-shadow', 'descShadow', 'none');
    css('.cont-box', 'background', 'contBgColor', 'rgba(43, 52, 61, 0.8)');
    css('.cont-box', 'backdrop-filter', 'contBgBlur', 3, (n) => (helpCfg?.bgBlur === false ? 'none' : `blur(${n}px)`));
    css('.help-group', 'background', 'headerBgColor', 'rgba(34, 41, 51, .4)');
    css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(34, 41, 51, .2)');
    css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(34, 41, 51, .4)');
    return {
      style: `${ret.join('\n')}`,
      width,
      colCount,
    };
  }
</script>

<style lang="less">
  @import '../style/miao';

  .@{prefix-cls} {
    .setting-box {
      width: 40px;
      height: 40px;
      position: absolute;
      right: 20px;
    }
  }
</style>
