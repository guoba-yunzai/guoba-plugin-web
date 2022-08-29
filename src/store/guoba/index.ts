import type { Plugins } from '/#/guoba';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { pluginApi } from '/@/api/guoba';

interface GuobaState {
  plugins: Plugins | null;
}

export const useGuobaStore = defineStore({
  id: 'guoba',
  state: (): GuobaState => ({
    plugins: null,
  }),
  getters: {},
  actions: {
    async getPlugins(force = false): Promise<Plugins> {
      if (force || this.plugins == null) {
        let plugins = await pluginApi.getPlugins(force);
        this.plugins = plugins;
        return plugins;
      }
      return this.plugins || [];
    },
  },
});

export function useGuobaStoreWithOut() {
  return useGuobaStore(store);
}
