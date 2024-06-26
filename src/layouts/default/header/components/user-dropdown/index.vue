<template>
  <Dropdown placement="bottomLeft" :overlayClassName="`${prefixCls}-dropdown-overlay`">
    <span :class="[prefixCls, `${prefixCls}--${theme}`]" class="flex">
      <!--<img :class="`${prefixCls}__header`" :src="getUserInfo.avatar" alt=""/>-->
      <GAvatar :class="`${prefixCls}__header`" :id="getUserInfo.userId" :qs="100" :size="24" />
      <span :class="`${prefixCls}__info hidden md:block`">
        <span :class="`${prefixCls}__name  `" class="truncate">
          {{ getUserInfo.realName }}
        </span>
      </span>
    </span>

    <template #overlay>
      <Menu @click="handleMenuClick">
        <!--        <MenuItem-->
        <!--          key="doc"-->
        <!--          :text="t('layout.header.dropdownItemDoc')"-->
        <!--          icon="ion:document-text-outline"-->
        <!--          v-if="getShowDoc"-->
        <!--        />-->
        <MenuDivider v-if="getShowDoc" />
        <MenuItem v-if="getUseLockPage" key="lock" :text="t('layout.header.tooltipLock')" icon="ion:lock-closed-outline" />
        <MenuItem key="logout" :text="t('layout.header.dropdownItemLoginOut')" icon="ion:power-outline" />
        <MenuDivider />
        <MenuItem key="restart-guoba" text="重启Guoba" icon="solar:restart-bold" />
        <MenuItem key="restart-bot" text="重启Bot" icon="solar:restart-bold" />
      </Menu>
    </template>
  </Dropdown>
  <LockAction @register="register" />
</template>
<script lang="tsx">
  // components
  import { Dropdown, Menu } from 'ant-design-vue';
  import type { MenuInfo } from 'ant-design-vue/lib/menu/src/interface';

  import { computed, defineComponent } from 'vue';

  import { DOC_URL } from '/@/settings/siteSetting';

  import { useUserStore } from '/@/store/modules/user';
  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';

  import headerImg from '/@/assets/images/header.jpg';
  import { propTypes } from '/@/utils/propTypes';
  import { openWindow } from '/@/utils';

  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { botApi, sysApi } from '/@/api/guoba';
  import { sleep } from '/@/utils/common';

  type MenuEvent = 'logout' | 'doc' | 'lock' | 'restart-bot' | 'restart-guoba';

  export default defineComponent({
    name: 'UserDropdown',
    components: {
      Dropdown,
      Menu,
      MenuItem: createAsyncComponent(() => import('./DropMenuItem.vue')),
      MenuDivider: Menu.Divider,
      LockAction: createAsyncComponent(() => import('../lock/LockModal.vue')),
    },
    props: {
      theme: propTypes.oneOf(['dark', 'light']),
    },
    setup() {
      const { prefixCls } = useDesign('header-user-dropdown');
      const { t } = useI18n();
      const { getShowDoc, getUseLockPage } = useHeaderSetting();
      const userStore = useUserStore();

      const getUserInfo = computed(() => {
        const { realName = '', avatar, desc, userId } = userStore.getUserInfo || {};
        return { realName, avatar: avatar || headerImg, desc, userId };
      });

      const [register, { openModal }] = useModal();

      function handleLock() {
        openModal(true);
      }

      //  login out
      function handleLoginOut() {
        userStore.confirmLoginOut();
      }

      // open doc
      function openDoc() {
        openWindow(DOC_URL);
      }

      const { createConfirm } = useMessage();

      function handleRestartBot() {
        createConfirm({
          title: '重启',
          iconType: 'warning',
          content: `确定要立即重启Bot吗？`,
          async onOk() {
            await botApi.doRestart();
            await sleep(5000);
            window.location.reload();
          },
        });
      }

      function handleRestartGuoba() {
        createConfirm({
          title: '重启',
          iconType: 'warning',
          content: (
            <div>
              <p style="color: #333">确定要立即重启Guoba吗？</p>
              <p style="color: #999">不会重启Bot</p>
            </div>
          ),
          async onOk() {
            await sysApi.doRestartGuoba();
            await sleep(1000);
            window.location.reload();
          },
        });
      }

      function handleMenuClick(e: MenuInfo) {
        switch (e.key as MenuEvent) {
          case 'logout':
            handleLoginOut();
            break;
          case 'doc':
            openDoc();
            break;
          case 'lock':
            handleLock();
            break;
          case 'restart-bot':
            handleRestartBot();
            break;
          case 'restart-guoba':
            handleRestartGuoba();
            break;
        }
      }

      return {
        prefixCls,
        t,
        getUserInfo,
        handleMenuClick,
        getShowDoc,
        register,
        getUseLockPage,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-user-dropdown';

  .@{prefix-cls} {
    height: @header-height;
    padding: 0 0 0 10px;
    padding-right: 10px;
    overflow: hidden;
    font-size: 12px;
    cursor: pointer;
    align-items: center;

    img {
      width: 24px;
      height: 24px;
      margin-right: 12px;
    }

    &__header {
      border-radius: 50%;

      &.ant-avatar {
        margin-right: 8px;
      }
    }

    &__name {
      font-size: 14px;
    }

    &--dark {
      &:hover {
        background-color: @header-dark-bg-hover-color;
      }
    }

    &--light {
      &:hover {
        background-color: @header-light-bg-hover-color;
      }

      .@{prefix-cls}__name {
        color: @text-color-base;
      }

      .@{prefix-cls}__desc {
        color: @header-light-desc-color;
      }
    }

    &-dropdown-overlay {
      .ant-dropdown-menu-item {
        min-width: 160px;
      }
    }
  }
</style>
