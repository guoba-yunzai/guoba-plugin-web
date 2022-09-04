<template>
  <PageWrapper>
    <template #headerContent>
      <WorkbenchHeader :data="homeData" :weather="weather" />
    </template>
    <div class="lg:flex">
      <div class="lg:w-7/10 w-full !mr-4 enter-y">
        <PluginsCard :plugins="plugins" :loading="loading" class="enter-y" />
        <DynamicInfo v-if="false" :loading="loading" class="!my-4 enter-y" />
      </div>
      <div class="lg:w-3/10 w-full enter-y">
        <QuickNav :loading="loading" class="enter-y" />

        <Card v-if="false" class="!my-4 enter-y" :loading="loading">
          <img class="xl:h-50 h-30 mx-auto" src="../../../assets/svg/illustration.svg" alt="" />
        </Card>

        <SaleRadar :loading="loading" class="!my-4 enter-y" />
      </div>
    </div>
  </PageWrapper>
</template>
<script lang="ts">
  import type { Plugins } from '/#/guoba';
  import { ref, defineComponent } from 'vue';
  import { Card } from 'ant-design-vue';
  import { PageWrapper } from '/@/components/Page';
  import QuickNav from './components/QuickNav.vue';
  import SaleRadar from './components/SaleRadar.vue';
  import PluginsCard from './components/PluginsCard.vue';
  import DynamicInfo from './components/DynamicInfo.vue';
  import WorkbenchHeader from './components/WorkbenchHeader.vue';
  import { sysApi, helperApi } from '/@/api/guoba';
  import { useGuobaStore } from '/@/store/guoba';

  export default defineComponent({
    components: {
      Card,
      PageWrapper,
      QuickNav,
      SaleRadar,
      PluginsCard,
      DynamicInfo,
      WorkbenchHeader,
    },
    setup() {
      const guobaStore = useGuobaStore();
      const loading = ref(true);
      const homeData = ref({});
      const weather = ref({});
      const plugins = ref<Plugins>([]);

      async function getHomeData() {
        try {
          loading.value = true;
          homeData.value = await sysApi.getHomeData().catch(console.error);
          weather.value = await helperApi.getCityWeather().catch(console.error);
          plugins.value = await guobaStore.getPlugins().catch(console.error);
        } finally {
          loading.value = false;
        }
      }

      getHomeData();

      return {
        homeData,
        weather,
        plugins,
        loading,
      };
    },
  });
</script>
