import type { App } from 'vue';
import type { componentMapType } from '/@/components/Form/src/componentMap';
import GAvatar from './src/GAvatar.vue';
import GSpan from './src/GSpan.vue';
import { registerPrompt } from './src/Prompt';
import { registerV2 } from '/@/views/guoba/v2/install';

export function registerGuoba(app: App) {
  registerV2(app);
  registerPrompt(app);
  app.component('GSpan', GSpan);
  app.component(GAvatar.name, GAvatar);
}

export async function registerGuobaComponent(componentMap: componentMapType) {
  const { default: GTags } = await import('./src/GTags.vue');
  const { default: GSubForm } = await import('./src/SubForm/SubForm.vue');
  const { default: GSelectFriend } = await import('./src/GSelectFriend.vue');
  const { default: GSelectGroup } = await import('./src/GSelectGroup.vue');
  const { default: GColorPicker } = await import('./src/GColorPicker.vue');

  componentMap.set('GTags', GTags);
  componentMap.set('GSubForm', GSubForm);
  componentMap.set('GSelectFriend', GSelectFriend);
  componentMap.set('GSelectGroup', GSelectGroup);
  componentMap.set('GColorPicker', GColorPicker);

  const { default: EasyCron } = await import('./src/EasyCron/EasyCronInput.vue');

  componentMap.set('EasyCron', EasyCron);
}
