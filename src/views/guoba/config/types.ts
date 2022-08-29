import type { FormSchema, FormActionType } from '/@/components/Form'

export interface IConfigTab {
  key: string;
  title: string;
  cards: ConfigCards;
}

export interface IConfigCard {
  key: string;
  type?: 'keyFormCard' | 'arrayFormCard' | string,
  title: string;
  desc: string;
  schemas: FormSchema[];
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
}

export type FormsType = FormType[]
