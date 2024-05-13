import { unref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { blobToDataUrl, dataURLtoBlob } from '/@/utils/file/base64Conver';
import { useMessage } from '/@/hooks/web/useMessage';

export enum MiaoApi {
  help = '/plugin/miao/help',
  helpIcon = '/plugin/miao/help/icon',
  helpBackup = '/plugin/miao/help/backup',
  themeList = '/plugin/miao/help/theme/list',
  themeConfig = '/plugin/miao/help/theme/config',
  themeAction = '/plugin/miao/help/theme/action',
}

// 获取喵喵帮助配置
export function getMiaoHelpCfg() {
  return defHttp.get({ url: MiaoApi.help }, { errorMessageMode: 'modal' });
}

// 保存喵喵帮助配置
export async function saveMiaoHelpCfg(helpCfg, helpList, iconB64List, mainB64) {
  let formData = new FormData();
  formData.append('helpCfg', JSON.stringify(unref(helpCfg), null, 2));
  formData.append('helpList', JSON.stringify(unref(helpList), null, 2));
  formData.append('icon', await joinIcon(unref(iconB64List)));
  if (unref(mainB64)) {
    formData.append('main', await dataURLtoBlob(unref(mainB64)));
  }
  return defHttp.post(
    {
      url: MiaoApi.help,
      params: formData,
      timeout: -1,
    },
    { errorMessageMode: 'modal' },
  );
}

async function getImageBase64(url) {
  let res = await defHttp.get({ url, responseType: 'blob', timeout: -1 }, { isTransformResponse: false, isReturnNativeResponse: true, errorMessageMode: 'modal' });
  let blob = res.data as Blob;
  return await blobToDataUrl(blob);
}

export async function getHelpIconList(base64?: string) {
  if (!base64) {
    base64 = await getImageBase64(MiaoApi.helpIcon);
  }
  let img = new Image();
  img.src = base64;
  await waitOnload(img);
  return await splitIcon(img);
}

function splitIcon(img: HTMLImageElement) {
  return new Promise<Nullable<string[]>>((resolve) => {
    img.setAttribute('crossOrigin', 'Anonymous');
    let cvs = document.createElement('canvas');
    cvs.width = 100;
    cvs.height = 100;
    let ctx = cvs.getContext('2d');
    if (!ctx) {
      resolve(null);
    } else {
      let x,
        y,
        iconList = [] as string[],
        length = Math.round(img.height / 10);
      for (let i = 0; i < length; i++) {
        y = Math.floor(i / 10);
        x = i - 10 * y;
        ctx.drawImage(img, 100 * x, 100 * y, 100, 100, 0, 0, 100, 100);
        iconList[i + 1] = cvs.toDataURL();
        ctx.clearRect(0, 0, 100, 100);
      }
      resolve(iconList);
    }
  });
}

async function joinIcon(iconB64List: string[]) {
  let { createMessage: $message } = useMessage();
  let cvs = document.createElement('canvas');
  cvs.width = 1000;
  // 高度向上取整
  cvs.height = Math.ceil((iconB64List.length - 1) / 10) * 100;
  let ctx = cvs.getContext('2d')!;
  let x, y;
  for (let i = 0; i < iconB64List.length; i++) {
    let base64 = iconB64List[i + 1];
    if (!base64) {
      continue;
    }
    let img = new Image();
    y = Math.floor(i / 10);
    x = i - 10 * y;
    img.src = base64;
    try {
      await waitOnload(img);
    } catch (e) {
      console.error(e);
      $message.error(`第 ${i + 1} 个图标保存失败`);
      continue;
    }
    ctx.drawImage(img, 100 * x, 100 * y, 100, 100);
  }
  return new Promise<Blob>((resolve) => cvs.toBlob(resolve as any));
}

async function waitOnload(img: HTMLImageElement) {
  return new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
}

// 获取备份列表
export function getBackupList() {
  let url = MiaoApi.helpBackup + '/list';
  return defHttp.get({ url }, { errorMessageMode: 'modal' });
}

// 新增备份
export function addBackup(remark) {
  return defHttp.post({ url: MiaoApi.helpBackup, params: { remark } }, { errorMessageMode: 'modal' });
}

// 还原备份
export function restoreBackup(id) {
  let url = MiaoApi.helpBackup + '/restore';
  return defHttp.post({ url, params: { id } }, { errorMessageMode: 'modal' });
}

// 删除备份
export function deleteBackup(id) {
  let url = MiaoApi.helpBackup + '/delete';
  return defHttp.delete({ url, params: { id } }, { errorMessageMode: 'modal' });
}

// 获取皮肤列表（一并返回配置）
export function getThemeList() {
  return defHttp.get({ url: MiaoApi.themeList }, { errorMessageMode: 'modal' });
}

// 获取皮肤配置
export function getThemeConfig(themeName: string) {
  return defHttp.get(
    {
      url: MiaoApi.themeConfig,
      params: { themeName: themeName || 'default' },
    },
    { errorMessageMode: 'modal' },
  );
}

// 保存皮肤配置
export function saveThemeConfig(themeName: string, config) {
  return defHttp.post(
    {
      url: MiaoApi.themeConfig,
      params: { themeName, config },
    },
    { errorMessageMode: 'modal' },
  );
}

/**
 * 新增皮肤
 * @param themeName
 * @param mainPic
 */
export async function addThemeItem(themeName: string, mainPic) {
  let formData = new FormData();
  formData.append('themeName', themeName);
  formData.append('mainPic', mainPic);
  return defHttp.post(
    {
      url: MiaoApi.themeAction,
      params: formData,
      timeout: -1,
    },
    { errorMessageMode: 'modal' },
  );
}

/**
 * 修改皮肤底图
 * @param themeName
 * @param mainPic
 */
export async function putThemeItem(themeName: string, mainPic) {
  let formData = new FormData();
  formData.append('themeName', themeName);
  formData.append('mainPic', mainPic);
  return defHttp.post(
    {
      url: MiaoApi.themeAction + '_put',
      params: formData,
      timeout: -1,
    },
    { errorMessageMode: 'modal' },
  );
}

/**
 * 删除皮肤
 * @param themeName
 */
export async function deleteThemeItem(themeName: string) {
  return defHttp.delete({ url: MiaoApi.themeAction, params: { themeName }, timeout: -1 }, { errorMessageMode: 'modal' });
}
