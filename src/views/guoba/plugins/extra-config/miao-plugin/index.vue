<template>
  <PageWrapper :class="[prefixCls]" title="编辑喵喵帮助" dense sticky stickyTop="-14px">
    <template #headerContent>
      <EditMiaoHeader @save="saveData" @rollback="todo('回滚')" @backup="todo('备份')" />
    </template>
    <div class="flex justify-center md:pt-4 my-4">
      <Transition name="scroll-y-reverse-transition">
        <HelpPanel
          v-if="!loading"
          v-model:helpCfg="helpCfg"
          v-model:helpList="helpList"
          v-model:bgB64="bgB64"
          v-model:mainB64="mainB64"
          v-model:iconB64List="iconB64List"
          v-model:modelData="modelData"
        />
      </Transition>
    </div>
  </PageWrapper>
</template>

<script lang="ts">
  import {defineComponent, ref} from 'vue';
  import type {
    helpCfgType,
    helpListType,
    modelDataType,
  } from './types'

  import {PageWrapper} from '/@/components/Page';
  import EditMiaoHeader from "./components/MiaoHeader.vue";
  import HelpPanel from "./components/HelpPanel.vue";
  import temp from "./temp"
  import { useDesign } from '/@/hooks/web/useDesign'

  export default defineComponent({
    name: 'MiaoPluginExtra',
    components: {HelpPanel, EditMiaoHeader, PageWrapper},
    setup() {
      const {prefixCls} = useDesign('edit-miao-help')
      const loading = ref<boolean>(true)
      const helpCfg = ref<Nullable<helpCfgType>>(null);
      const helpList = ref<Nullable<helpListType>>(null);
      const bgB64 = ref<Nullable<string>>(null)
      const mainB64 = ref<Nullable<string>>(null)
      const iconB64List = ref<Nullable<string[]>>(null)
      const modelData = ref<modelDataType>({
        show: false,
        cell: null,
        cellIndex: null,
        group: null,
        groupIndex: null
      })

      const saveData = async () => {
        let data = {
          helpCfg: helpCfg.value,
          helpList: helpList.value,
          iconB64: await joinIcon(iconB64List),
          mainB64: mainB64.value
        }
        // TODO-guoba 改为接口
        console.log(data);
      }

      const todo = msg => {
        console.log(msg);
      }

      const joinIcon = async iconB64List => new Promise<string>(resolve => {
        let cvs = document.createElement("canvas")
        cvs.width = 1000
        cvs.height = 1000
        let ctx = cvs.getContext("2d")
        let x, y
        for (let i = 0; i < 100; i++) {
          let img = new Image;
          y = Math.floor(i / 10)
          x = i - 10 * y
          img.src = iconB64List.value[i + 1];
          let _x = x
          let _y = y
          let _i = i
          img.onload = function () {
            ctx!.drawImage(img, 100 * _x, 100 * _y, 100, 100);
            if (_i === 99) {
              resolve(cvs.toDataURL())
            }
          }
        }
      })

      const splitIcon = async iconB64 => new Promise<Nullable<string[]>>(resolve => {
        let img = new Image;
        img.setAttribute("crossOrigin", 'Anonymous')
        img.src = iconB64
        img.onload = function () {
          let cvs = document.createElement("canvas")
          cvs.width = 100
          cvs.height = 100
          let ctx = cvs.getContext("2d")
          if (!ctx) {
            resolve(null)
          } else {
            let x, y, iconList = [] as string[]
            for (let i = 0; i < 100; i++) {
              y = Math.floor(i / 10)
              x = i - 10 * y
              ctx.drawImage(img, 100 * x, 100 * y, 100, 100, 0, 0, 100, 100);
              iconList[i + 1] = cvs.toDataURL()
              ctx.clearRect(0, 0, 100, 100)
            }
            resolve(iconList)
          }
        }
      })

      const loadData = async () => {
        loading.value = true
        // TODO-guoba 此处改为接口获取数据
        helpCfg.value = temp.helpCfg
        helpList.value = temp.helpList
        bgB64.value = await temp.bgB64
        mainB64.value = await temp.mainB64
        iconB64List.value = await splitIcon(await temp.iconB64)
        loading.value = false
      }

      loadData()

      return {
        prefixCls,
        loading,
        helpCfg,
        helpList,
        bgB64,
        mainB64,
        iconB64List,
        modelData,
        saveData,
        todo
      }
    }
  })
</script>
<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-edit-miao-help';

  .@{prefix-cls} {
    .ant-page-header {
      padding-right: 8px;
      padding-bottom: 8px;
    }

    @media screen and (max-width: 800px) {
      .size {
        height: 0;
        padding-top: 15.16%;
        position: relative;
      }
    }
  }
</style>
