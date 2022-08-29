import type { VNode } from 'vue';
import type { BasicColumn } from '/@/components/Table';

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
      if (record.name) {
        return <a href={record.link} target="_blank">{record.name}</a>;
      }
      return record.name;
    },
  },
  {
    title: '插件作者',
    dataIndex: 'author',
    width: 180,
    customRender: ({ record }) => {
      if (record.authorLink) {
        return <a href={record.authorLink} target="_blank">{record.author}</a>;
      }
      return record.author;
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
    customRender: ({ record }) => {
      let status: VNode[] = [];
      let divider = <a-divider type="vertical" />;
      if (record.installed) {
        status.push(<a-tag color="green">已安装</a-tag>);
      } else {
        status.push(<a-tag>未安装</a-tag>);
      }
      if (record.isV3) {
        status.push(divider);
        status.push(<a-tag color="blue">V3</a-tag>);
      }
      if (record.isDeleted) {
        status.push(divider);
        status.push(<a-tag color="red">已失效</a-tag>);
      }
      return <span>{status}</span>;
    },
  },
];
