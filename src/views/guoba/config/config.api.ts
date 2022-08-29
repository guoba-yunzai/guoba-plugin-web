import { defHttp } from '/@/utils/http/axios'

export enum Api {
  configTabs = '/config/tabs',
  configData = '/config/data',
}

// 获取配置列表
export function queryConfigTabs() {
  return defHttp.get({ url: Api.configTabs })
}

/**
 * 获取配置具体数据
 * @param key 配置文件key
 */
export function queryConfigData(key: string) {
  return defHttp.get({ url: Api.configData, params: { key } }, { errorMessageMode: 'modal' })
}

/**
 * 保存配置数据
 * @param key
 * @param data
 */
export function saveConfigData(key: string, data: Recordable) {
  return defHttp.post({ url: Api.configData, params: { key, data } })
}
