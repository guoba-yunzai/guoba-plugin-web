import type { FormSchema, FormActionType } from '/@/components/Form';
import type { PromptProps } from '/@/components/Guoba/src/Prompt/typing';

export interface IConfigTab {
  key: string;
  title: string;
  cards: ConfigCards;
}

export interface IConfigCard {
  key: string;
  type?: 'keyFormCard' | 'arrayFormCard' | string;
  title: string;
  desc: string;
  schemas: FormSchema[];
  // 当type为keyFormCard或arrayFormCard时，是否允许添加
  allowAdd?: boolean;
  // 当type为keyFormCard或arrayFormCard时，是否允许删除
  allowDel?: boolean;
  // 当type为keyFormCard时的新增按钮文本
  addBtnText?: string;
  // 当type为arrayFormCard时的最小长度
  lengthMin?: number;
  // 当type为arrayFormCard时的最大长度
  lengthMax?: number;
  promptProps?: PromptProps;
}

export type ConfigTabs = IConfigTab[];
export type ConfigCards = IConfigCard[];

export interface FormType {
  key: string;
  loading: boolean;
  register?: (...args) => void;
  actions?: FormActionType;
  isKeyForm?: boolean;
  isArrayForm?: boolean;
  schemas?: any;
  card?: any;
  fieldKey?: string;
}

export type FormsType = FormType[];
