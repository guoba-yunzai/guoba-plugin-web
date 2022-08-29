<template>
  <div> 登录中…… </div>
</template>

<script lang="ts">
  import { computed, defineComponent, nextTick } from 'vue';
  import { router } from '/@/router';
  import { defHttp } from '/@/utils/http/axios';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    name: 'MasterLogin',
    setup() {
      let code = computed(() => router.currentRoute.value.params.code);
      const userStore = useUserStore();

      async function login() {
        let { ok, result } = await defHttp.post(
          {
            url: '/login/quick',
            params: { code: code.value },
          },
          {
            retryRequest: { isOpenRetry: false },
            isTransformResponse: false,
          },
        );
        if (ok && result && result.token) {
          userStore.setToken(result.token);
          await nextTick();
        }
        router.replace('/login');
      }

      login();

      return {};
    },
  });
</script>

<style scoped></style>
