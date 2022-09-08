import { defHttp } from '/@/utils/http/axios'

export enum MiaoApi {
  help = '/plugin/miao/help',
}

// 获取喵喵帮助配置
export function getMiaoHelpCfg() {
  return defHttp.get({ url: MiaoApi.help }, { errorMessageMode: 'modal' })
}

// 保存喵喵帮助配置
export function saveMiaoHelpCfg(params) {
  return defHttp.post({ url: MiaoApi.help, params }, { errorMessageMode: 'modal' })
}

// TODO 备份喵喵帮助配置
export function backupMiaoHelpCfg(params) {
  return defHttp.put({ url: MiaoApi.help, params }, { errorMessageMode: 'modal' })
}
