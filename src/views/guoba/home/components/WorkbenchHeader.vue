<template>
  <div class="lg:flex">
    <GAvatar :id="userinfo.userId" :qs="100" :size="60" class="!mx-auto !block" />
    <div class="md:ml-6 flex flex-col justify-center md:mt-0 mt-2">
      <h1 class="md:text-lg text-md">{{ textWelcome }}</h1>
      <span class="text-secondary"> {{ textSecondary }} </span>
    </div>
    <div class="flex flex-1 justify-end md:mt-0 mt-4">
      <div class="flex flex-col justify-center text-right">
        <span class="text-secondary"> Cookie用户数 </span>
        <span class="text-2xl">{{ data.cookieCount }}</span>
      </div>

      <div class="flex flex-col justify-center text-right md:mx-16 mx-12">
        <span class="text-secondary"> 群聊数量 </span>
        <span class="text-2xl">{{ data.groupCount }}</span>
      </div>
      <div class="flex flex-col justify-center text-right md:mr-10 mr-4">
        <span class="text-secondary"> 好友数量 </span>
        <span class="text-2xl">{{ data.friendCount }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { propTypes } from '/@/utils/propTypes';
  import { GAvatar } from '/@/components/Guoba';
  import { timeFix, welcome } from '/@/utils/common';

  const props = defineProps({
    data: propTypes.object.isRequired,
    weather: propTypes.object.isRequired,
  });

  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);

  const textWelcome = computed(() => {
    if (!userinfo.value) {
      return 'loading…';
    }
    let time = timeFix();
    let text = welcome();
    return `${time}，${userinfo.value?.realName}，${text}`;
  });

  const textSecondary = computed(() => {
    let { weather } = props;
    if (!weather || !weather.forecast) {
      return 'loading…';
    }
    let { type, low, high } = weather.forecast[0];
    return `${weather.city}今日${type}，最${low}，最${high}`;
  });
  
</script>
