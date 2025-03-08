import type { FormSchema } from '/@/components/Form';
import lodash from 'lodash-es';

export const settingSchemas: FormSchema[] = [
  {
    field: 'title',
    label: '帮助标题',
    component: 'Input',
    componentProps: {
      allowClear: false,
      placeholder: '请输入帮助主标题',
    },
  },
  {
    field: 'subTitle',
    label: '副标题',
    component: 'Input',
    componentProps: {
      allowClear: false,
      placeholder: '请输入帮助副标题',
    },
  },
  {
    field: 'colCount',
    label: '列数',
    component: 'RadioButtonGroup',
    componentProps: {
      options: [
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' },
      ],
    },
    bottomHelpMessage: '设置列数过多可能导致阅读困难',
  },
  {
    field: 'colWidth',
    label: '单列宽度',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入单列宽度',
      allowClear: false,
      style: { width: '180px' },
    },
    bottomHelpMessage: '过窄可能导致文字有较多换行，默认265',
  },
  {
    field: 'bgBlur',
    label: '毛玻璃',
    component: 'Switch',
    bottomHelpMessage: '是否启用背景毛玻璃效果，若渲染遇到问题关闭',
  },
  {
    field: 'themeSet',
    label: '指定皮肤',
    component: 'Switch',
    bottomHelpMessage: '不指定皮肤则使用全部皮肤，随机进行展示',
  },
  {
    field: 'theme',
    label: '皮肤',
    component: 'Select',
    componentProps: {
      placeholder: '请选择皮肤',
      allowClear: false,
      mode: 'multiple',
      options: [{ value: 'default', label: 'default' }],
    },
    bottomHelpMessage: '指定皮肤展示，可多选，随机展示',
    ifShow: ({ model }) => model.themeSet === true,
  },
  {
    field: 'themeExclude',
    label: '排除皮肤',
    component: 'Select',
    componentProps: {
      placeholder: '排除的皮肤',
      allowClear: false,
      mode: 'multiple',
      options: [{ value: 'default', label: 'default' }],
    },
    bottomHelpMessage: '指定被排除的皮肤，排除后不会展示',
  },
];

export function useThemeConfigSchemas(expand?: Partial<FormSchema>) {
  const merge = (s: FormSchema) => lodash.merge<FormSchema, typeof expand>(s, expand);
  return [
    merge({
      field: 'fontColor',
      label: '主文字颜色',
      component: 'GColorPicker',
    }),
    merge({
      field: 'fontShadow',
      label: '主文字阴影',
      component: 'Input',
      bottomHelpMessage: '默认"none"，填写示例："0px 0px 1px rgba(6, 21, 31, .9)"',
    }),
    merge({
      field: 'descShadow',
      label: '描述文字阴影',
      component: 'Input',
      bottomHelpMessage: '默认"none"，填写示例："0px 0px 1px rgba(6, 21, 31, .9)"',
    }),
    merge({
      field: 'descColor',
      label: '描述文字颜色',
      component: 'GColorPicker',
    }),
    merge({
      field: 'contBgColor',
      label: '整体底色',
      component: 'GColorPicker',
      helpMessage: '若无需此项可设为完全透明。注意若综合透明度较低，或颜色与主文字颜色过近或太透明可能导致阅读困难！',
      bottomHelpMessage: '会叠加在标题栏及帮助行之下，方便整体帮助有一个基础底色',
    }),
    merge({
      field: 'contBgBlur',
      label: '毛玻璃效果',
      component: 'InputNumber',
      componentProps: {
        min: 0,
        max: 10,
      },
      bottomHelpMessage: '面板底图毛玻璃效果，数字越大越模糊，0-10 ，可为小数',
    }),
    merge({
      field: 'headerBgColor',
      label: '标题栏底色',
      component: 'GColorPicker',
      bottomHelpMessage: '板块标题栏底色',
    }),
    merge({
      field: 'rowBgColor1',
      label: '奇数行底色',
      component: 'GColorPicker',
      bottomHelpMessage: '帮助奇数行底色',
    }),
    merge({
      field: 'rowBgColor2',
      label: '偶数行底色',
      component: 'GColorPicker',
      bottomHelpMessage: '帮助偶数行底色',
    }),
  ] as FormSchema[];
}
