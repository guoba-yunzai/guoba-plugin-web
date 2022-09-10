import { unref } from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { blobToDataUrl, dataURLtoBlob } from '/@/utils/file/base64Conver'

export enum MiaoApi {
  help = '/plugin/miao/help',
  helpIcon = '/plugin/miao/help/icon',
  helpTheme = '/plugin/miao/help/theme',
  helpBackup = '/plugin/miao/help/backup',
}

// 获取喵喵帮助配置
export function getMiaoHelpCfg() {
  return defHttp.get({ url: MiaoApi.help }, { errorMessageMode: 'modal' })
}

// 保存喵喵帮助配置
export async function saveMiaoHelpCfg(helpCfg, helpList, iconB64List, mainB64) {
  let formData = new FormData()
  formData.append('helpCfg', JSON.stringify(unref(helpCfg), null, 2))
  formData.append('helpList', JSON.stringify(unref(helpList), null, 2))
  formData.append('icon', await joinIcon(unref(iconB64List)))
  formData.append('main', await dataURLtoBlob(unref(mainB64)))
  return defHttp.post({ url: MiaoApi.help, params: formData }, { errorMessageMode: 'modal' })
}

export function getThemeMainBase64() {
  return getImageBase64(MiaoApi.helpTheme + '/main')
}

export function getThemeBgBase64() {
  return getImageBase64(MiaoApi.helpTheme + '/bg')
}

async function getImageBase64(url) {
  let res = await defHttp.get(
    { url, responseType: 'blob' },
    { isTransformResponse: false, isReturnNativeResponse: true, errorMessageMode: 'modal' },
  )
  let blob = res.data as Blob
  return await blobToDataUrl(blob)
}

export async function getHelpIconList() {
  let img = new Image()
  img.src = await getImageBase64(MiaoApi.helpIcon)
  await new Promise((resolve) => (img.onload = resolve))
  return await splitIcon(img)
}

function splitIcon(img: HTMLImageElement) {
  return new Promise<Nullable<string[]>>((resolve) => {
    img.setAttribute('crossOrigin', 'Anonymous')
    let cvs = document.createElement('canvas')
    cvs.width = 100
    cvs.height = 100
    let ctx = cvs.getContext('2d')
    if (!ctx) {
      resolve(null)
    } else {
      let x,
        y,
        iconList = [] as string[]
      for (let i = 0; i < 100; i++) {
        y = Math.floor(i / 10)
        x = i - 10 * y
        ctx.drawImage(img, 100 * x, 100 * y, 100, 100, 0, 0, 100, 100)
        iconList[i + 1] = cvs.toDataURL()
        ctx.clearRect(0, 0, 100, 100)
      }
      // console.log(iconList)
      resolve(iconList)
    }
  })
}

async function joinIcon(iconB64List: string[]) {
  return await new Promise<Blob>((resolve) => {
    let cvs = document.createElement('canvas')
    cvs.width = 1000
    cvs.height = 1000
    let ctx = cvs.getContext('2d')
    let x, y
    for (let i = 0; i < 100; i++) {
      let img = new Image()
      y = Math.floor(i / 10)
      x = i - 10 * y
      img.src = iconB64List[i + 1]
      let _x = x
      let _y = y
      let _i = i
      img.onload = function () {
        ctx!.drawImage(img, 100 * _x, 100 * _y, 100, 100)
        if (_i === 99) {
          cvs.toBlob((blob) => resolve(blob!))
        }
      }
    }
  })
}

// 获取备份列表
export function getBackupList() {
  let url = MiaoApi.helpBackup + '/list'
  return defHttp.get({ url }, { errorMessageMode: 'modal' })
}

// 新增备份
export function addBackup(remark) {
  return defHttp.post(
    { url: MiaoApi.helpBackup, params: { remark } },
    { errorMessageMode: 'modal' },
  )
}

// 还原备份
export function restoreBackup(id) {
  let url = MiaoApi.helpBackup + '/restore'
  return defHttp.post({ url, params: { id } }, { errorMessageMode: 'modal' })
}

// 删除备份
export function deleteBackup(id) {
  let url = MiaoApi.helpBackup + '/delete'
  return defHttp.delete({ url, params: { id } }, { errorMessageMode: 'modal' })
}
