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
    <div class="vc-chrome-field custom">
      <VueColorEI
        label="a"
        :value="rgba.a"
        :min="0"
        :max="1"
        :arrow-offset="0.01"
        @change="onInput"
      />
    </div>
    <div class="vc-chrome-field">
      <Popover trigger="click" placement="bottom" :getPopupContainer="(n) => n.parentNode">
        <template #content>
          <VueColorChrome :value="innerValue" @input="onValueChange" />
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

  const props = defineProps({
    value: String,
  });
  const emit = defineEmits(['change']);
  const { prefixCls } = useDesign('g-color-picker');
  const rgbaReg = /rgba\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3}), ?([10]?\.?\d+)\)/;
  const defaultRgba = { r: 0, g: 0, b: 0, a: 1 };
  const innerValue = reactive({ rgba: defaultRgba });
  const rgba = computed(() => innerValue.rgba);

  const emitChangeDebounce = debounce(emitChange, 100) as Function;

  watch(
    () => props.value,
    (val) => {
      if (val && rgbaReg.test(val)) {
        let matches: string[] = val.match(rgbaReg)!;
        innerValue.rgba.r = parseInt(matches[1]);
        innerValue.rgba.g = parseInt(matches[2]);
        innerValue.rgba.b = parseInt(matches[3]);
        innerValue.rgba.a = parseFloat(matches[4]);
      } else {
        innerValue.rgba = defaultRgba;
        emitChange();
      }
    },
    { immediate: true },
  );

  function onValueChange(color) {
    innerValue.rgba = color.rgba;
    emitChangeDebounce();
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
    let { r, g, b, a } = innerValue.rgba;
    emit('change', `rgba(${r}, ${g}, ${b}, ${a})`);
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
