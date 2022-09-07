export interface helpCfgType {
  title: string
  subTitle: string
}

export interface listItemType {
  icon: number,
  title: string,
  desc: string
}

export type ListType = listItemType[]

export interface helpListItemType {
  group: string
  desc?: string
  auth?: "master"
  list: ListType
}

export type helpListType = helpListItemType[]

export interface modelDataType {
  show: boolean
  cell: Nullable<listItemType>
  cellIndex: Nullable<number>
  group: Nullable<helpListItemType>
  groupIndex: Nullable<number>
}
