import {useAppStoreWithOut} from '/@/store/modules/app';

/**
 * todo 此方法试验成功，唯一缺点就是不能使用 slots 插槽。
 * 还需要完善的地方：
 * 1. 使用专用的 ceStore 来存储自定义组件
 * 2. ceStore.register(this) 方法，用于注册自定义组件
 * 3. ceStore.unregister(this) 方法，用于注销自定义组件
 * 4. 自动处理 props
 * 5. 自动处理事件
 * 6. 监听组件销毁，并且自动执行 ceStore.unregister(this)
 */
class MyButtonElement extends HTMLElement {
  private readonly appStore: ReturnType<typeof useAppStoreWithOut>;

  $vm: any;

  $onCreated: Fn | null = null;

  constructor() {
    super();
    this.appStore = useAppStoreWithOut();
  }

  connectedCallback() {
    this.appStore.teleportHTML = this;
    this.appStore.teleportText = this.getAttribute('text')!;
    this.appStore.isTeleport = true;
    this.appStore.teleportCallback = (vm) => {
      console.log('teleportCallback - vm :', vm);
      this.$vm = vm;
      this.$onCreated && this.$onCreated();
    };
  }

  static get observedAttributes() {
    return ['text'];
  }

  //
  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (name === 'text' && oldValue !== newValue) {
      // console.log('attributeChangedCallback - text :', newValue);
      this.appStore.teleportText = newValue;
    }
  }

  private checkVm() {
    if (!this.$vm) {
      throw 'The component has not been created yet';
    }
  }

  $on(key: string, fn: Fn) {
    this.checkVm();
    this.$vm.$on(key, fn);
  }

  $off(key: string, fn: Fn) {
    this.checkVm();
    this.$vm.$off(key, fn);
  }
}

customElements.define('custom-my-button', MyButtonElement);
