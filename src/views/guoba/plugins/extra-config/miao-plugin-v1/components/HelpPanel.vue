<template>
  <div :style="`transform: scale(${scale});transform-origin: center top;`">
    <div class="wrap" :style="wrapStyle">
      <div class="change-background">
        <input type="file" id="upload-bg" style="display: none" name="icon" accept="image/bmp,image/jpeg,image/png" />
        <input type="file" id="upload-icon" style="display: none" name="icon" accept="image/png" />
        <Dropdown :trigger="['click']" :dropMenuList="dropMenuList">
          <a-button :style="`transform: scale(${1 / scale});transform-origin: right top;`" type="primary" shape="circle" size="large">
            <Icon icon="akar-icons:image" />
          </a-button>
        </Dropdown>
      </div>

      <div class="head-box" @click="clickHead">
        <div class="title">
          {{ helpCfg.title }}
        </div>
        <div class="label">
          {{ helpCfg.subTitle }}
        </div>
      </div>

      <div class="cont-box" v-for="(group, groupIndex) in helpList" :key="groupIndex">
        <div class="help-group" @click="clickBody(null, null, group, groupIndex)">
          {{ group.group }}
        </div>

        <div v-if="group.list && group.list.length > 0" class="help-table">
          <div v-for="(result, row) in split(group.list)" class="tr" :key="row">
            <div class="td" v-for="(cell, col) in result" :key="col" :class="cell === modelData.cell ? 'active' : 'inactive'" @click="clickBody(cell, 3 * row + col, group, groupIndex)">
              <transition name="fade-transition">
                <div>
                  <div class="help-icon" :style="`background: url(${iconB64List[cell.icon]}) 0 0 no-repeat`" />
                  <div class="help-title"> {{ cell.title }}</div>
                  <div class="help-desc"> {{ cell.desc }}</div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <div class="copyright">
        Created By Yunzai-Bot
        <span class="version">{{ versions.yunzai }}</span>
        &amp; Miao-Plugin
        <span class="version">{{ versions.miao }}</span>
      </div>
    </div>

    <modal v-model:visible="showHeadModal" title="编辑标题" :closable="false" :footer="null">
      <div class="p-4">
        <div class="row">
          <div>主标题</div>
          <div class="flex-1">
            <a-input v-model:value="helpCfg.title" placeholder="主标题" />
          </div>
        </div>

        <div class="row">
          <div>副标题</div>
          <div class="flex-1">
            <a-input v-model:value="helpCfg.subTitle" placeholder="附标题" />
          </div>
        </div>
      </div>
    </modal>

    <EditBodyModal :helpList="helpList" :modelData="modelData" :iconB64List="iconB64List" />
    <UploadIconHelpModal @register="registerUihModal" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import EditBodyModal from './EditBodyModal.vue';
  import { Modal } from 'ant-design-vue';
  import { helpCfgType, helpListItemType, helpListType, listItemType, ListType, modelDataType } from '../types';
  import { Dropdown, DropMenu } from '/@/components/Dropdown';
  import { getHelpIconList } from '/@/views/guoba/plugins/extra-config/miao-plugin/miao.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { createLocalStorage } from '/@/utils/cache';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useModal } from '/@/components/Modal';
  import UploadIconHelpModal from './UploadIconHelpModal.vue';
  import {getAppEnvConfig} from "/@/utils/env";

  const { VITE_PUBLIC_PATH } = getAppEnvConfig();
  const ls = createLocalStorage();
  const permStore = usePermissionStore();
  const [registerUihModal, uihModal] = useModal();

  const props = defineProps({
    helpCfg: Object as PropType<helpCfgType>,
    helpList: Object as PropType<helpListType>,
    bgB64: String,
    mainB64: String,
    cacheVer: Number,
    iconB64List: Array as PropType<string[]>,
    modelData: Object as PropType<modelDataType>,
    versions: Object as PropType<{ yunzai: string; miao: string }>,
  });

  const emits = defineEmits(['update:modelData', 'update:mainB64', 'update:iconB64List']);

  const { createMessage: $message } = useMessage();

  const showHeadModal = ref<boolean>(false);

  const dropMenuList = ref<DropMenu[]>([
    {
      event: 'changeBackground',
      text: '更换背景',
      icon: 'akar-icons:image',
      onClick() {
        getUploadBase64('upload-bg', (base64) => {
          emits('update:mainB64', base64);
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
            emits('update:iconB64List', iconList);
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

  const isBindEvent = {};

  const wrapStyle = computed(() => {
    let style: Recordable = {};
    let themePath = `${VITE_PUBLIC_PATH}/api/plugin/miao/help/theme/$s?token=${permStore.liteToken}&_v=${props.cacheVer}`;
    let themeBg = themePath.replace('$s', 'bg');
    let themeMain = themePath.replace('$s', 'main');
    if (props.mainB64) {
      themeMain = props.mainB64;
    }
    style.background = `url(${themeMain}) top left/100% auto no-repeat,url(${themeBg})`;
    return style;
  });

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
            input.value = null;
          };
        }
      });
    }
    input.click();
  }

  const clickHead = () => {
    showHeadModal.value = true;
  };

  const clickBody = (cell: listItemType, cellIndex: number, group: helpListItemType, groupIndex: number) => {
    emits('update:modelData', { show: true, cell, cellIndex, group, groupIndex });
  };

  const split = (item_list: ListType) => {
    let result: listItemType[][] = [];
    for (let i = 0; i < item_list.length; i += 3) {
      result.push(item_list.slice(i, i + 3));
    }
    return result;
  };

  const scale = computed<Number>(() => {
    if (document.body.clientWidth > 850) {
      return 1;
    } else {
      return document.body.clientWidth / 850;
    }
  });
</script>

<style scoped>
  .wrap {
    box-shadow: 0 0 15px #888;
    border-radius: 10px;
    width: 830px;
    padding: 20px 15px 10px 15px;
    background-size: 100% auto;
  }

  .change-background {
    margin: 10px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .head-box {
    border-radius: 15px;
    padding: 10px 20px;
    position: relative;
    color: #fff;
  }

  .head-box:hover {
    cursor: pointer;
  }

  .title {
    font-size: 50px;
    font-family: NZBZ, sans-serif;
    text-shadow: 0 0 1px #000, 1px 1px 3px rgb(0 0 0 / 90%);
  }

  .label {
    font-size: 16px;
    text-shadow: 0 0 1px #000, 1px 1px 3px rgb(0 0 0 / 90%);
    font-family: Number, '微软雅黑', sans-serif;
  }

  .cont-box {
    border-radius: 15px;
    margin-top: 20px;
    margin-bottom: 20px;
    padding: 5px 15px;
    overflow: hidden;
    box-shadow: 0 5px 10px 0 rgb(0 0 0 / 15%);
    position: relative;
    background: rgba(43, 52, 61, 0.8);
    font-family: Number, '微软雅黑', sans-serif;
    color: white;
  }

  .help-group {
    color: #ceb78b;
    font-size: 18px;
    font-weight: bold;
    padding: 8px 0 5px 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .help-group:hover {
    transform-origin: left;
    color: #fafad2;
  }

  .help-table {
    text-align: center;
    border-collapse: collapse;
    margin: 5px -10px -10px -15px;
    border-radius: 0 0 10px 10px;
    display: table;
    overflow: hidden;
    width: calc(100% + 30px);
    color: #fff;
  }

  .help-table .tr {
    display: table-row;
  }

  .help-table .td {
    font-size: 14px;
    display: table-cell;
    box-shadow: 0 0 1px 0 #888 inset;
    padding: 12px 0 12px 50px;
    line-height: 24px;
    position: relative;
    width: 33.33%;
    overflow: auto;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }

  .help-table .tr:nth-child(odd) {
    background: rgba(34, 41, 51, 0.6);
  }

  .help-table .tr:nth-child(even) {
    background: rgba(34, 41, 51, 0.3);
  }

  .help-table .tr:last-child .td {
    padding-bottom: 12px;
  }

  .help-icon {
    width: 80px;
    height: 80px;
    display: block;
    position: absolute;
    border-radius: 5px;
    transform: scale(0.425) translateX(-47px) translateY(-47px);
    left: 6px;
    top: 12px;
  }

  .help-title {
    display: block;
    color: #d3bc8e;
    font-size: 16px;
    line-height: 24px;
  }

  .help-desc {
    display: block;
    font-size: 13px;
    line-height: 18px;
    color: #eee;
  }

  .copyright {
    font-size: 16px;
    font-family: 'Number', sans-serif;
    text-align: center;
    color: #fff;
    position: relative;
    padding-left: 10px;
    text-shadow: 1px 1px 1px #000;
    margin: 10px 0;
  }

  .version {
    font-size: 13px;
    color: #d3bc8e;
    display: inline-block;
    padding: 0 3px;
  }

  .active {
    background-color: #3983a3;
    transform: scale(1.02);
  }

  .inactive:hover {
    background-color: #3983a3;
    z-index: 100;
  }
</style>
