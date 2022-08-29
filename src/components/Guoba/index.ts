import type { App } from 'vue';
import GAvatar from './src/GAvatar.vue';

export function registerGuoba(app: App) {
  app.component(GAvatar.name, GAvatar);
}

export {
  GAvatar,
};

export {default as PageCoding} from './src/PageCoding.vue';