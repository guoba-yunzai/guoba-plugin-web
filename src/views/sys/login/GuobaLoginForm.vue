<template>
  <a-empty style="margin: 0 auto">
    <template #description> 请以主人的身份，向你的机器人发送“#锅巴登录”指令进行登录。</template>
  </a-empty>

  <a-button block @click="handleCodeLogin" :loading="loading"> 使用验证码登录</a-button>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { sleep } from '/@/utils/common';
  import { useUserStore } from '/@/store/modules/user';
  import { usePrompt } from '/@/components/Guoba';
  import { useMessage } from '/@/hooks/web/useMessage';

  const userStore = useUserStore();
  const { createPrompt } = usePrompt();

  const loading = ref(false);
  const { createMessage: $message } = useMessage();

  async function handleCodeLogin() {
    try {
      loading.value = true;
      await userStore.loginCodeRequest();
    } catch (e) {
    } finally {
      loading.value = false;
    }
    createPrompt({
      title: '验证码登录',
      required: true,
      placeholder: '请输入验证码',
      bottomHelpMessage: '验证码可在控制台查看',
      rules: [
        { required: true, message: '请输入验证码' },
        { min: 16, message: '验证码格式不正确' },
      ],
      okText: '登录',
      async onOk(value) {
        const res = await userStore.loginCodeCheck(value);
        if (res?.token) {
          userStore.setToken(res.token);
          await sleep(500);
          window.location.reload();
        } else {
          $message.error('登录失败');
        }
      },
    });
  }
</script>
