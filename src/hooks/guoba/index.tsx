import type { Plugin } from '/#/guoba';
import { VNode } from 'vue';

export function getStatusTags(record: Plugin, size = 4) {
  let status: VNode[] = [];
  if (record.installed) {
    status.push(<a-tag color="green">已安装</a-tag>);
  } else {
    status.push(<a-tag>未安装</a-tag>);
  }
  if (record.hasConfig) {
    status.push(<a-tag color="purple">可配置</a-tag>);
  }
  if (record.isV3) {
    status.push(<a-tag color="blue">V3</a-tag>);
  }
  if (record.isV2) {
    status.push(<a-tag color="orange">V2</a-tag>);
  }
  if (record.isDeleted) {
    status.push(<a-tag color="red">已失效</a-tag>);
  }
  return <a-space size={size}>{status}</a-space>;
}
