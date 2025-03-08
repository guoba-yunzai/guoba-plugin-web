export interface helpCfgType {
  // 帮助标题
  title: string;

  // 帮助副标题
  subTitle: string;

  // 帮助表格列数，可选：2-5，默认3
  // 注意：设置列数过多可能导致阅读困难，请参考实际效果进行设置
  colCount: number;

  // 单列宽度，默认265
  // 注意：过窄可能导致文字有较多换行，请根据实际帮助项设定
  colWidth: number;

  // 皮肤选择，可多选，或设置为all
  // 皮肤包放置于 resources/help/theme
  // 皮肤名为对应文件夹名
  // theme: 'all', // 设置为全部皮肤
  // theme: ['default','theme2'], // 设置为指定皮肤
  theme: 'all' | string[];

  // 排除皮肤：在存在其他皮肤时会忽略该项内设置的皮肤
  // 默认忽略default：即存在其他皮肤时会忽略自带的default皮肤
  // 如希望default皮肤也加入随机池可删除default项
  themeExclude: string[];

  // 是否启用背景毛玻璃效果，若渲染遇到问题可设置为false关闭
  bgBlur: boolean;
}

export interface ThemeConfigType {
  // 主文字颜色
  fontColor: string;
  // 主文字阴影： 横向距离 垂直距离 阴影大小 阴影颜色
  // fontShadow: '0px 0px 1px rgba(6, 21, 31, .9)',
  fontShadow: 'none' | string;
  // 描述文字阴影： 横向距离 垂直距离 阴影大小 阴影颜色
  // descShadow: '0px 0px 1px rgba(6, 21, 31, .9)',
  descShadow: 'none' | string;
  // 描述文字颜色
  descColor: string;

  /* 面板整体底色，会叠加在标题栏及帮助行之下，方便整体帮助有一个基础底色
   *  若无需此项可将rgba最后一位置为0即为完全透明
   *  注意若综合透明度较低，或颜色与主文字颜色过近或太透明可能导致阅读困难 */
  contBgColor: string;

  // 面板底图毛玻璃效果，数字越大越模糊，0-10 ，可为小数
  contBgBlur: number;

  // 板块标题栏底色
  headerBgColor: string;
  // 帮助奇数行底色
  rowBgColor1: string;
  // 帮助偶数行底色
  rowBgColor2: string;
}

export interface listItemType {
  icon: number;
  title: string;
  desc: string;
}

export type ListType = listItemType[];

export interface helpListItemType {
  group: string;
  desc?: string;
  auth?: 'master';
  list: ListType;
}

export type helpListType = helpListItemType[];

export interface modelDataType {
  show: boolean;
  cell: Nullable<listItemType>;
  cellIndex: Nullable<number>;
  group: Nullable<helpListItemType>;
  groupIndex: Nullable<number>;
}
