import type { App } from 'vue';
import { defineCustomElement } from 'vue';

import GuobaButton from './GuobaButton.ce.vue';
import BasicButton from '/@/components/Button/src/BasicButton.vue'; // 注册自定义组件

// import './test'
import './test2'

// 注册自定义组件
export function registerCustomComponents(_app: App) {
  console.log('registerCustomComponents - defineCustomElement :', defineCustomElement);

  customElements.define('custom-button', defineCustomElement(BasicButton));
  // GuobaButton.prototype.shadowRoot = null//GuobaButton.prototype.attachShadow({mode: 'closed'});
  // GuobaButton.prototype.shadowRoot = null//GuobaButton.prototype.attachShadow({mode: 'closed'});
  // @ts-ignore
  const xxx = defineCustomElement(GuobaButton, function (...args) {
    console.log('defineCustomElement - args :', args);
    // args[1].attachShadow({mode: 'closed'});
    // args[1].attachShadow({mode: 'open'});
    // @ts-ignore
    args[1].attachShadow({ mode: 'open' });
  });

  class yyy extends xxx {
    constructor() {
      super();
      // this.shadowRoot = '233';
    }

    // @ts-ignore
    // noinspection JSUnusedGlobalSymbols
    get shadowRoot() {
      // this.attachShadow({mode: 'open'});
      // console.log('shadowRoot - this :', this)
      // return document.body
      return this;
    }
  }

  // console.log('registerCustomComponents - xxx.prototype.shadowRoot 1:', xxx.shadowRoot)
  // xxx.shadowRoot = 'xxx';
  // console.log('registerCustomComponents - xxx.prototype.shadowRoot 2:', xxx.shadowRoot)
  // @ts-ignore
  customElements.define('guoba-button', yyy);
  // customElements.define('guoba-button', GuobaButton);
}
