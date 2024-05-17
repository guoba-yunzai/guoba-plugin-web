import { createApp, defineComponent, h } from 'vue';
import BasicButton from '/@/components/Button/src/BasicButton.vue';
// import {Button} from 'ant-design-vue';
// import 'element-plus/dist/index.css';

/**
 * todo 此方法试验失败
 */
class MyButtonElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // const mountPoint = document.createElement('span');
    // this.appendChild(mountPoint);
    // this.innerHTML = '<div>233</div>';

    const mountPoint = this.attachShadow({ mode: 'open' });
    // const slotContent = this.innerHTML; // 获取自定义元素内的内容

    const XXX = defineComponent({
      // template: '<basic-button><div v-html="content"></div></basic-button>',
      template: '<basic-button><slot></slot></basic-button>',
      components: {
        'basic-button': BasicButton,
      },
      // data() {
      //   return {
      //     content: slotContent,
      //   };
      // },
    });

    const app = createApp({
      render: () => h(XXX),
      // h(
      //   BasicButton,
      //   {
      //     // text: this.getAttribute('text'),
      //   },
      //   // () => [h('slot')],
      //   () => '<slot></slot>',
      // ),
    });
    // 清空自定义元素的内容，因为已经保存在slotContent中
    // this.innerHTML = '';

    console.log(0, 'this.slot:', this.slot);

    // app.use(Button);
    // app.mount(this);
    app.mount(mountPoint);
  }

  // static get observedAttributes() {
  //   return ['text'];
  // }

  // attributeChangedCallback(name, oldValue, newValue) {
  //   if (name === 'text' && oldValue !== newValue) {
  //     this.connectedCallback();
  //   }
  // }
}

customElements.define('custom-my-button', MyButtonElement);
