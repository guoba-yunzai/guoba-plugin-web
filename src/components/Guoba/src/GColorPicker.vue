<template>
  <div :class="[prefixCls, 'vc-chrome-fields']">
    <div class="vc-chrome-field custom">
      <VueColorEI label="r" :value="rgba.r" :min="0" :max="255" @change="onInput" />
    </div>
    <div class="vc-chrome-field custom">
      <VueColorEI label="g" :value="rgba.g" :min="0" :max="255" @change="onInput" />
    </div>
    <div class="vc-chrome-field custom">
      <VueColorEI label="b" :value="rgba.b" :min="0" :max="255" @change="onInput" />
    </div>
    <div v-if="!disableAlpha" class="vc-chrome-field custom">
      <VueColorEI label="a" :value="rgba.a" :min="0" :max="1" :arrow-offset="0.01" @change="onInput" />
    </div>
    <div class="vc-chrome-field">
      <Popover trigger="click" placement="bottom" :getPopupContainer="(n) => n.parentNode">
        <template #content>
          <VueColorChrome :value="innerValue" @input="onValueChange" :disableAlpha="disableAlpha" />
        </template>
        <div class="vc-color-view">
          <div :style="`height:100%;background:rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`" />
        </div>
      </Popover>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, reactive, computed } from 'vue';
  import { Popover } from 'ant-design-vue';
  import { VueColorChrome, VueColorEI } from '/@/components/VueColor';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { debounce } from 'lodash-es';

  type colorType = 'rgb' | 'rgba' | 'hex' | 'hex8';

  const props = defineProps({
    value: String,
  });
  const emit = defineEmits(['change']);
  const regs = {
    rgb: /rgb\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)/,
    rgba: /rgba\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3}), ?([10]?\.?\d+)\)/,
    // 支持 3 或 6 位
    hex: /#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/,
    // 只支持 8 位
    hex8: /#([0-9a-fA-F]{8})/,
  };
  const { prefixCls } = useDesign('g-color-picker');
  const defaultRgba = { r: 0, g: 0, b: 0, a: 1 };
  const innerValue = reactive({ rgba: defaultRgba, hex8: '#000000FF' });
  const valueType = ref<colorType>('rgba');

  const rgba = computed(() => innerValue.rgba);
  const disableAlpha = computed(() => ['rgb', 'hex'].includes(valueType.value));

  const emitChangeDebounce = debounce(emitChange, 100) as Function;

  watch(
    () => props.value,
    (val) => {
      if (val) {
        if (regs.rgb.test(val)) {
          valueType.value = 'rgb';
          parseRgbColor(val);
        } else if (regs.rgba.test(val)) {
          valueType.value = 'rgba';
          parseRgbColor(val, true);
        } else if (regs.hex.test(val)) {
          valueType.value = 'hex';
          parseHexColor(val);
        } else if (regs.hex8.test(val)) {
          valueType.value = 'hex8';
          parseHexColor(val, true);
        } else {
          innerValue.rgba = defaultRgba;
          emitChange();
        }
      } else {
        innerValue.rgba = defaultRgba;
        emitChange();
      }
    },
    { immediate: true },
  );

  function parseRgbColor(value: string, alpha = false) {
    let matches: string[];
    if (alpha) {
      matches = value.match(regs.rgba)!;
    } else {
      matches = value.match(regs.rgb)!;
    }
    innerValue.rgba.r = parseInt(matches[1]);
    innerValue.rgba.g = parseInt(matches[2]);
    innerValue.rgba.b = parseInt(matches[3]);
    if (alpha) {
      innerValue.rgba.a = parseFloat(matches[4]);
    } else {
      innerValue.rgba.a = 1;
    }
  }

  function parseHexColor(value: string, alpha = false) {
    let matches: string[], hex: string;
    if (alpha) {
      matches = value.match(regs.hex8)!;
      hex = matches[1];
      if (hex.length !== 8) {
        innerValue.rgba = defaultRgba;
        console.error('hex8 color must be 8 length');
        return;
      }
    } else {
      matches = value.match(regs.hex)!;
      hex = matches[1];
      if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
      }
    }
    innerValue.rgba.r = parseInt(hex.slice(0, 2), 16);
    innerValue.rgba.g = parseInt(hex.slice(2, 4), 16);
    innerValue.rgba.b = parseInt(hex.slice(4, 6), 16);
    if (alpha) {
      innerValue.rgba.a = parseInt(hex.slice(6, 8), 16) / 255;
    } else {
      innerValue.rgba.a = 1;
    }
  }

  function onValueChange(color) {
    console.log('onValueChange:', color);
    if (color.hex8 && color.rgba) {
      innerValue.rgba = color.rgba;
      innerValue.hex8 = color.hex8;
      emitChangeDebounce();
    }
  }

  function onInput(value, type) {
    if (value.target) {
      return;
    }
    for (let [key, v] of Object.entries(value)) {
      let num = parseFloat(v as string);
      if (isNaN(num)) {
        num = 0;
      }
      innerValue.rgba[key] = num;
    }
    emitChangeDebounce();
  }

  function emitChange() {
    if (valueType.value === 'rgb') {
      let { r, g, b } = innerValue.rgba;
      emit('change', `rgb(${r}, ${g}, ${b})`);
    } else if (valueType.value === 'hex') {
      let hex8 = innerValue.hex8;
      emit('change', hex8.slice(0, 7));
    } else if (valueType.value === 'hex8') {
      let hex8 = innerValue.hex8;
      emit('change', hex8);
    } else {
      let { r, g, b, a } = innerValue.rgba;
      emit('change', `rgba(${r}, ${g}, ${b}, ${a})`);
    }
  }
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-g-color-picker';

  .@{prefix-cls} {
    .vc-chrome-field {
      &.custom {
        width: 60px;
      }

      .vc-color-view {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBSUhKfNAPjqAHDIgz+//+PNx08f/4cfzoYNYCBceiHAQC5flV5JzgrxQAAAABJRU5ErkJggg==');
        box-shadow: 0 0 3px 2px rgba(100, 149, 237, 0.2);
        transition: box-shadow 0.3s ease-in-out;

        &:hover {
          box-shadow: 0 0 4px 3px rgba(100, 149, 237, 0.3);
        }
      }

      .vc-input__label {
        margin-top: 4px;
      }
    }

    .ant-popover-content {
      box-shadow: none;
    }

    .ant-popover-inner-content {
      padding: 0;
    }
  }
</style>
