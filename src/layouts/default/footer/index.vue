<template>
  <Footer :class="prefixCls" v-if="getShowLayoutFooter" ref="footerRef">
    <div :class="`${prefixCls}__links`">
<!--      <a @click="openWindow(SITE_URL)">{{ t('layout.footer.onlinePreview') }}</a>-->
      <a href="https://oicqjs.github.io/oicq/" target="_blank">OICQ文档</a>

      <GithubFilled @click="openWindow('https://gitee.com/guoba-yunzai')" :class="`${prefixCls}__github`" />

      <a href="https://github.com/Le-niao/Yunzai-Bot" target="_blank">Yunzai-Bot</a>
<!--      <a @click="openWindow(DOC_URL)">{{ t('layout.footer.onlineDocument') }}</a>-->
    </div>
    <div :class="`${prefixCls}__links`">
      <span>Copyright &copy;2022</span> 
      <a href="https://github.com/zolay-poi" target="_blank"> Zolay-poi </a>
      <span> & </span>
      <a href="https://github.com/vbenjs/vue-vben-admin" target="_blank"> Vben Admin </a>
    </div>
  </Footer>
</template>

<script lang="ts">
  import { computed, defineComponent, unref, ref } from 'vue';
  import { Layout } from 'ant-design-vue';

  import { GithubFilled } from '@ant-design/icons-vue';

  import { DOC_URL, GITHUB_URL, SITE_URL } from '/@/settings/siteSetting';
  import { openWindow } from '/@/utils';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useRouter } from 'vue-router';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useLayoutHeight } from '../content/useContentViewHeight';

  export default defineComponent({
    name: 'LayoutFooter',
    components: { Footer: Layout.Footer, GithubFilled },
    setup() {
      const { t } = useI18n();
      const { getShowFooter } = useRootSetting();
      const { currentRoute } = useRouter();
      const { prefixCls } = useDesign('layout-footer');

      const footerRef = ref<ComponentRef>(null);
      const { setFooterHeight } = useLayoutHeight();

      const getShowLayoutFooter = computed(() => {
        if (unref(getShowFooter)) {
          const footerEl = unref(footerRef)?.$el;
          setFooterHeight(footerEl?.offsetHeight || 0);
        } else {
          setFooterHeight(0);
        }
        return unref(getShowFooter) && !unref(currentRoute).meta?.hiddenFooter;
      });

      return {
        getShowLayoutFooter,
        prefixCls,
        t,
        DOC_URL,
        GITHUB_URL,
        SITE_URL,
        openWindow,
        footerRef,
      };
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-layout-footer';

  @normal-color: rgba(0, 0, 0, 0.45);

  @hover-color: rgba(0, 0, 0, 0.85);

  .@{prefix-cls} {
    color: rgba(0, 0, 0, 0.45);
    text-align: center;

    &__links {
      margin-bottom: 8px;

      a {
        color: rgba(0, 0, 0, 0.45);

        &:hover {
          color: @hover-color;
        }
      }
    }

    &__github {
      margin: 0 30px;

      &:hover {
        color: @hover-color;
      }
    }
  }
</style>
