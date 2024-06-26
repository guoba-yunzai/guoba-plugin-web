import type { App } from 'vue';
import { Button } from './Button';
import { Form, Input, Layout, Row, Col, Card, Spin, Skeleton, Tooltip, Select, Tabs, Empty, Tag, Divider, Popconfirm, Space, List, Radio, Checkbox } from 'ant-design-vue';
import { Icon } from '/@/components/Icon';

export function registerGlobComp(app: App) {
  app
    .use(Form)
    .use(Input)
    .use(Button)
    .use(Layout)
    .use(Row)
    .use(Col)
    .use(Card)
    .use(Spin)
    .use(Tooltip)
    .use(Skeleton)
    .use(Select)
    .use(Tabs)
    .use(Empty)
    .use(Tag)
    .use(Divider)
    .use(Popconfirm)
    .use(Space)
    .use(List)
    .use(Radio)
    .use(Checkbox);

  app.component(Icon.name, Icon);
}
