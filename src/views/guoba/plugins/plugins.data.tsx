import type { Plugin } from '/#/guoba';
import type { BasicColumn } from '/@/components/Table';
import { getStatusTags } from '/@/hooks/guoba';
import { parseAuthorLink } from '/@/utils/guoba';

export const columns: BasicColumn[] = [
  {
    title: '插件标题',
    dataIndex: 'title',
    width: 200,
  },
  {
    title: '插件名称',
    dataIndex: 'name',
    width: 200,
    customRender: ({ record }) => {
      if (record.link) {
        return (
          <a href={record.link} target="_blank">
            {record.name}
          </a>
        );
      }
      return record.name;
    },
  },
  {
    title: '插件作者',
    dataIndex: 'author',
    width: 180,
    customRender: ({ record }) => {
      return parseAuthorLink(record);
    },
  },
  {
    title: '插件说明',
    dataIndex: 'description',
    align: 'left',
  },
  {
    title: '状态',
    dataIndex: 'installed',
    align: 'left',
    width: 240,
    customRender: ({ record }) => getStatusTags(record as Plugin, 8),
  },
];
