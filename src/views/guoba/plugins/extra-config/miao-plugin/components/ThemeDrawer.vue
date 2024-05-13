<template>
  <BasicDrawer v-bind="getProps">
    <a-spin :wrapperClassName="`${prefixCls} p-2`" :spinning="loading">
      <div style="margin-bottom: 8px">
        <a-button type="primary" preIcon="ant-design:plus" @click="onAdd">新增皮肤</a-button>
      </div>
      <a-list size="large" bordered :dataSource="themeList">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.name">
              <template #description>
                <div class="theme-desc">
                  <a-row type="flex" :gutter="8">
                    <a-col style="width: 150px">
                      <img :src="getThemeSrc(item.name)" alt="皮肤底图" />
                    </a-col>
                    <a-col style="flex: 1">
                      <pre>{{ JSON.stringify(item.style, null, 2) }}</pre>
                    </a-col>
                  </a-row>
                </div>
              </template>
            </a-list-item-meta>
            <template #actions>
              <Dropdown v-if="item.name !== 'default'" :trigger="['click']" :dropMenuList="getDropMenuList(item)">
                <a-button type="primary" shape="circle" preIcon="ant-design:setting" />
              </Dropdown>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-spin>
    <ThemeConfigModal @register="registerConfigModal" @success="loadData" />

    <input ref="uploadBgRef" type="file" name="upload-bg" accept="image/bmp,image/jpeg,image/png" @change="onUploadBgChange" style="display: none" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import type { DrawerProps } from '/@/components/Drawer';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import type { ThemeConfigType } from '../types';
  import type { DropMenu } from '/@/components/Dropdown';
  import { Dropdown } from '/@/components/Dropdown';
  import { computed, nextTick, ref, unref } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { usePrompt } from '/@/components/Guoba';
  import { addThemeItem, deleteThemeItem, getThemeList, putThemeItem } from '../miao.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useDesign } from '/@/hooks/web/useDesign';
  import ThemeConfigModal from '/@/views/guoba/plugins/extra-config/miao-plugin/components/ThemeConfigModal.vue';
  import { useModal } from '/@/components/Modal';

  type ThemeItem = {
    // 皮肤名称
    name: string;
    style: ThemeConfigType;
  };

  const props = defineProps({
    themeNames: Array as PropType<string[]>,
  });
  const emit = defineEmits(['register', 'reload', 'update:themeNames']);
  const attrs = useAttrs();
  const { prefixCls } = useDesign('miao-plugin-theme-drawer');

  const { createMessage: $message, createConfirm } = useMessage();
  const { createPrompt } = usePrompt();
  const permStore = usePermissionStore();
  const uploadBgRef = ref<HTMLInputElement>();
  // 当前是否正在加载中
  const loading = ref(false);
  // 皮肤列表
  const themeList = ref<ThemeItem[]>([]);
  // 注册抽屉
  const [registerDrawer, { closeDrawer, setDrawerProps }] = useDrawerInner(open);
  const [registerConfigModal, configModal] = useModal();

  // 抽屉最终props
  const getProps = computed(() => {
    let drawerProps: Partial<DrawerProps> = {
      width: document.body.clientWidth >= 768 ? 700 : '100%',
      title: '喵喵帮助皮肤',
      confirmLoading: unref(loading),
    };
    let finalProps: Recordable = {
      ...unref(attrs),
      ...drawerProps,
      ...props,
      onOk: close,
      onCancel: close,
      onRegister: registerDrawer,
    };
    return finalProps;
  });

  /** 抽屉开启 */
  function open() {
    loadData();
  }

  let themePicVer = {};

  function getThemeSrc(name, type = 'main') {
    let ver = themePicVer[name] || 1;
    let themePath = `/api/plugin/miao/help/theme/$s?token=${permStore.liteToken}&themeName=${name}&_v=${ver}`;
    return themePath.replace('$s', type);
  }

  async function loadData() {
    try {
      setLoading(true);
      themeList.value = await getThemeList();
      let themeNames = themeList.value.map((t) => t.name);
      emit('update:themeNames', themeNames);
    } finally {
      setLoading(false);
    }
  }

  /** 抽屉关闭 */
  function close() {
    closeDrawer();
  }

  let onUploadBgChangeCallback: Fn | null = null;

  function openUploadBgFile() {
    uploadBgRef.value!.value = '';
    uploadBgRef.value!.click();
    return new Promise<Nullable<File>>((resolveOrigin) => {
      let resolved = false;
      let onWindowFocus = () => {
        setTimeout(() => {
          if (!resolved) {
            resolveOrigin(null);
          }
        }, 500);
      };
      let resolve = (value) => {
        if (!resolved) {
          resolved = true;
          window.removeEventListener('focus', onWindowFocus);
          resolveOrigin(value);
        }
      };
      window.addEventListener('focus', onWindowFocus);
      onUploadBgChangeCallback = async function (event) {
        let files = event?.target?.files;
        if (files && files.length <= 0) {
          resolve(null);
          return;
        }
        resolve(files[0]);
      };
    });
  }

  function onAdd() {
    createPrompt({
      title: '新增皮肤',
      required: true,
      placeholder: '请输入皮肤名称',
      okText: '确定并选择底图',
      async onOk(value) {
        let file = await openUploadBgFile();
        if (!file) {
          return Promise.reject('未选择底图');
        }
        await addThemeItem(value, file);
        await loadData();
      },
    });
  }

  async function onDelete(item: ThemeItem) {
    try {
      if (item.name === 'default') {
        $message.warn('默认皮肤不可删除');
        return;
      }
      setLoading(true);
      await deleteThemeItem(item.name);
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  /** 设置加载状态*/
  function setLoading(flag) {
    loading.value = flag;
    setDrawerProps({ confirmLoading: flag });
  }

  function onUploadBgChange(event) {
    if (typeof onUploadBgChangeCallback === 'function') {
      onUploadBgChangeCallback(event);
      onUploadBgChangeCallback = null;
    }
  }

  function getDropMenuList(item: ThemeItem): DropMenu[] {
    return [
      {
        event: 'change',
        text: '修改配置',
        icon: 'ant-design:edit',
        onClick() {
          configModal.openModal(true, item);
        },
      },
      {
        event: 'changePic',
        text: '更改底图',
        icon: 'akar-icons:image',
        async onClick() {
          try {
            setLoading(true);
            let file = await openUploadBgFile();
            if (file) {
              await putThemeItem(item.name, file);
              let ver = themePicVer[item.name] || 1;
              themePicVer[item.name] = ++ver;
            }
          } finally {
            setLoading(false);
          }
        },
      },
      {
        event: 'delete',
        text: '删除皮肤',
        icon: 'ant-design:delete',
        onClick() {
          createConfirm({
            title: '删除',
            iconType: 'warning',
            content: `确定要删除“${item.name}”吗？删除后不可恢复！`,
            onOk: () => onDelete(item),
          });
        },
      },
    ];
  }
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-miao-plugin-theme-drawer';
  .@{prefix-cls} {
    .theme-desc {
      img {
        width: 150px;
      }
    }
  }
</style>
