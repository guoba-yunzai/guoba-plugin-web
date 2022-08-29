import type { ErrorMessageMode } from '/#/axios';
import type { LoginParams } from '/@/api/sys/model/userModel';
import { defHttp } from '/@/utils/http/axios';

const enum SystemApi {
  login = '/login',
  logout = '/logout',
  homeData = '/home/data',
}

// 系统相关接口
export const sysApi = {
  doLogin(params: LoginParams, mode: ErrorMessageMode = 'modal') {
    return defHttp.post({ url: SystemApi.login, params }, { errorMessageMode: mode });
  },
  doLogout() {
    return defHttp.post({ url: SystemApi.logout });
  },
  async getHomeData() {
    return await defHttp.get({ url: SystemApi.homeData });
  },
};

const enum HelperApi {
  getCityWeather = '/helper/city_weather'
}

export const helperApi = {
  getCityWeather: () => defHttp.get({ url: HelperApi.getCityWeather }),
};

const enum UserApi {
  getLoginUser = '/user/getLoginUser',
}

// 用户相关接口
export const userApi = {
  getLoginUser: () => defHttp.get({ url: UserApi.getLoginUser }),
};

const enum PluginApi {
  getPlugins = '/plugin/list',
  getReadme = '/plugin/readme',
}

// 插件相关接口
export const pluginApi = {
  /**
   * 获取插件列表
   * @param force 是否清空缓存强制刷新
   */
  async getPlugins(force = false) {
    return await defHttp.get({ url: PluginApi.getPlugins, params: { force } });
  },
  async getReadme(link: string, force = false) {
    return await defHttp.get({ url: PluginApi.getReadme, params: { link, force } });
  },
};
