import type { App } from 'vue';
import type { componentMapType } from '/@/components/Form/src/componentMap';
import GAvatar from './src/GAvatar.vue';
import GSpan from './src/GSpan.vue';
import { registerPrompt } from './src/Prompt';
import { registerV2 } from '/@/views/guoba/v2/install';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

export function registerGuoba(app: App) {
  registerV2(app);
  registerPrompt(app);
  app.component('GSpan', GSpan);
  app.component(GAvatar.name, GAvatar);
}

export function registerGuobaComponent(componentMap: componentMapType) {
  componentMap.set(
    'GTags',
    registerAsyncComponent(() => import('./src/GTags.vue')),
  );
  componentMap.set(
    'GSubForm',
    registerAsyncComponent(() => import('./src/SubForm/SubForm.vue')),
  );
  componentMap.set(
    'GSelectFriend',
    registerAsyncComponent(() => import('./src/GSelectFriend.vue')),
  );
  componentMap.set(
    'GSelectGroup',
    registerAsyncComponent(() => import('./src/GSelectGroup.vue')),
  );
  componentMap.set(
    'GColorPicker',
    registerAsyncComponent(() => import('./src/GColorPicker.vue')),
  );
  componentMap.set(
    'EasyCron',
    registerAsyncComponent(async () => import('./src/EasyCron/EasyCronInput.vue')),
  );
}

function registerAsyncComponent(loader: Fn) {
  return createAsyncComponent(loader, { loading: true });
}
