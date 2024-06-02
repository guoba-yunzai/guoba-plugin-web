import { propTypes } from '/@/utils/propTypes';

export const cronEmits = ['change', 'update:value'];
export const cronProps = {
  value: {
    type: [String, Array] as PropType<string | string[]>,
    default: '',
  },
  multiple: propTypes.bool.def(false),
  disabled: propTypes.bool.def(false),
  hideSecond: propTypes.bool.def(false),
  hideYear: propTypes.bool.def(false),
  remote: propTypes.func,
};
