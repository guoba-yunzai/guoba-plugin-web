import type { App } from 'vue';
import { setApp } from './hooks/usePrompt';

export { usePrompt } from './hooks/usePrompt';
export { default as Prompt } from './Prompt.vue';

export function registerPrompt(app: App) {
  setApp(app);
}
