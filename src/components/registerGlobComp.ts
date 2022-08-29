import type { App } from 'vue';
import { Button } from './Button';
import {
  Input,
  Layout,
  Row,
  Col,
  Card,
  Spin,
  Tooltip,
  Select,
  Tabs,
  Empty,
  Tag,
  Divider,
  Popconfirm,
} from 'ant-design-vue';
import { Icon } from '/@/components/Icon'

export function registerGlobComp(app: App) {
  app.use(Input)
    .use(Button)
    .use(Layout)
    .use(Row).use(Col)
    .use(Card).use(Spin)
    .use(Tooltip)
    .use(Select)
    .use(Tabs)
    .use(Empty)
    .use(Tag)
    .use(Divider)
    .use(Popconfirm)

  app.component(Icon.name, Icon)
}
