import Chrome from './components/Chrome.vue';
import Alpha from './components/common/Alpha.vue';
import Checkboard from './components/common/Checkboard.vue';
import EditableInput from './components/common/EditableInput.vue';
import Hue from './components/common/Hue.vue';
import Saturation from './components/common/Saturation.vue';
import ColorMixin from './mixin/color.js';

const VueColor = {
  version: '2.8.2-rc.1',
  Chrome,
  Alpha,
  Checkboard,
  EditableInput,
  Hue,
  Saturation,
  ColorMixin,
};

// module.exports = VueColor
export default VueColor;
