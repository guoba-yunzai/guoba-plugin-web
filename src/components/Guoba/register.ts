import type { App } from 'vue';
import GAvatar from './src/GAvatar.vue';

export function registerGuoba(app: App) {
  app.component(GAvatar.name, GAvatar);
}

export async function registerGuobaComponent(componentMap) {
  const { default: GTags } = await import('./src/GTags.vue');
  const { default: GSelectFriend } = await import('./src/GSelectFriend.vue');

  componentMap.set('GTags', GTags);
  componentMap.set('GSelectFriend', GSelectFriend);
}