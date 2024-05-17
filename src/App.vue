<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <RouterView />

      <Teleport v-if="appStore.isTeleport" :to="appStore.teleportHTML!" :disabled="!appStore.isTeleport">
        <a-button ref="btnRef">
          {{ appStore.teleportText }}
        </a-button>
      </Teleport>
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '/@/components/Application';
  import { useTitle } from '/@/hooks/web/useTitle';
  import { useLocale } from '/@/locales/useLocale';

  import 'dayjs/locale/zh-cn';
  import { useAppStore } from '/@/store/modules/app';
  import { nextTick, ref, watch } from 'vue';
  // support Multi-language
  const { getAntdLocale } = useLocale();

  // Listening to page changes and dynamically changing site titles
  useTitle();

  const appStore = useAppStore();

  const btnRef = ref();

  watch(
    () => appStore.isTeleport,
    async (val) => {
      if (val) {
        await nextTick();
        appStore.teleportCallback && appStore.teleportCallback(btnRef.value);
      }
    },
  );
</script>
