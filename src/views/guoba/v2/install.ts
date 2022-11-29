import type { App } from 'vue';
import { router } from '/@/router';

const { VERSION } = window['__YUNZAI_BOT_CONF__'];
const isV2 = VERSION.startsWith('2');
const passName = ['MasterLogin', 'Login', 'V2Update'];

export function registerV2(_: App) {
  if (!isV2) return;
  // router.isReady().then(() => {
  router.beforeEach((to, _from, next) => {
    if (!passName.includes(to.name as string)) {
      next({ name: 'V2Update' });
    } else {
      next();
    }
  });
  // });
}

export function useV2Route() {
  if (!isV2) return [];
  return [
    {
      path: '/v2-update',
      name: 'V2Update',
      component: () => import('./index.vue'),
      meta: {
        title: '升级云崽',
        icon: 'ic:twotone-update',
      },
    },
  ];
}
