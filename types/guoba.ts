export interface Plugin {
  // 插件名称（唯一）
  name: string;
  // 插件标题
  title: string;
  // 插件git仓库链接
  link: string;
  // 是否是只支持V3的插件
  isV3: boolean;
  isV2: boolean;
  // 插件作者
  author: string | string[];
  // 插件作者链接
  authorLink: string | string[];
  // 插件说明
  description: string;
  // 图标（可选）
  icon?: string;
  // 图标颜色（可选）
  iconColor?: string;
  // 图标路径（可选）
  iconPath?: string;

  // 是否显示在菜单中
  showInMenu?: boolean;

  // 是否已安装
  installed: boolean;
  // 是否已删除（插件索引仓库里标记为删除线的）
  isDeleted: boolean;
  hasConfig: boolean;
}

export type Plugins = Plugin[];
