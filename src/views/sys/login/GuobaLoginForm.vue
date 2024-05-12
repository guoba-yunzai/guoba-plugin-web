<template>
  <a-empty style="margin: 0 auto">
    <template #description>请以主人的身份，向你的机器人发送“#锅巴登录”指令进行登录。</template>
  </a-empty>

  <div style="margin-bottom: 16px; display: flex; align-items: center;">
    <a-input
      style="flex-grow: 1; margin-right: 8px;"
      placeholder="请输入验证码"
      v-model:value="code"
      :disabled="loading"
    />
    <a-button :disabled="isCodeButtonDisabled" @click="handleCodeLogin">
      {{ isCodeButtonDisabled ? `${countdown}秒` : '获取验证码' }}
    </a-button>
  </div>
  
  <a-button block type="primary" @click="handleLogin" :loading="loading"> 登录 </a-button>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { sleep } from '/@/utils/common';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';

  const CODE_TIMEOUT = 300;
  const userStore = useUserStore();
  const { createMessage: $message } = useMessage();

  const loading = ref(false);
  const code = ref('');
  const countdown = ref(0);
  const isCodeButtonDisabled = ref(false);
  
  function initCountdown() {
    const savedTimestamp = localStorage.getItem('codeTimestamp');
    if (savedTimestamp) {
      const timePassed = Math.floor((Date.now() - Number(savedTimestamp)) / 1000);
      const remainingTime = CODE_TIMEOUT - timePassed;
      if (remainingTime > 0) {
        startCountdown(remainingTime);
      }
    }
  }

  function startCountdown(duration: number) {
    isCodeButtonDisabled.value = true;
    countdown.value = duration;
    const intervalId = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(intervalId);
        countdown.value = 0;
        isCodeButtonDisabled.value = false;
        localStorage.removeItem('codeTimestamp');
      }
    }, 1000);
  }

  async function handleCodeLogin() {
    try {
      loading.value = true;
      await userStore.loginCodeRequest();
      $message.success('验证码发送成功，请在控制台查收');
      localStorage.setItem('codeTimestamp', Date.now().toString());
      startCountdown(CODE_TIMEOUT);
    } catch (e) {
      $message.error('获取验证码失败');
    } finally {
      loading.value = false;
    }
  }

  async function handleLogin() {
    try {
      loading.value = true;
      if (!code.value) {
        $message.error('请输入验证码');
        return;
      }
      const res = await userStore.loginCodeCheck(code.value);
      if (res?.token) {
        userStore.setToken(res.token);
        $message.success('登录成功');
        localStorage.removeItem('codeTimestamp');
        await sleep(500);
        window.location.reload();
      } else {
        $message.error('登录失败');
      }
    } catch (e) {
      $message.error('登录失败');
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    initCountdown();
  });

  onUnmounted(() => {
    if (isCodeButtonDisabled.value) {
      localStorage.setItem('codeTimestamp', (Date.now() - (CODE_TIMEOUT - countdown.value) * 1000).toString());
    }
  });
</script>