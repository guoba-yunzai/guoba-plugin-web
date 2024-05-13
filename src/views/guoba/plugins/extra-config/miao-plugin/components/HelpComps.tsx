import type { PropType, VNode } from 'vue';
import type { ListType, listItemType, modelDataType } from '../types';
import { computed, defineComponent } from 'vue';

const HelpRow = defineComponent({
  name: 'HelpRow',
  props: {
    rowIndex: { type: Number, required: true },
    list: { type: Array as PropType<ListType>, required: true },
    colCount: { type: Number, required: true },
    iconB64List: { type: Array, required: true },
    modelData: { type: Object as PropType<modelDataType>, required: true },
  },
  emits: ['open'],
  setup(props, { emit }) {
    const tdNodes = computed(() => {
      const colCount = props.colCount;
      const start = props.rowIndex * colCount;
      const nodes: Nullable<VNode>[] = [];
      for (let i = 0; i < props.colCount; i++) {
        let idx = i + start;
        let cell = props.list[idx] as listItemType;
        let cellKey = `help-cell-${props.rowIndex}-${i}`;
        if (cell) {
          let iconStyle = {
            background: `url(${props.iconB64List[cell.icon]}) 0 0 no-repeat`,
          };
          let cellClass = [
            'td',
            {
              active: cell === props.modelData?.cell && props.modelData?.show,
            },
          ];
          nodes.push(
            <div class={cellClass} key={cellKey} onClick={() => onClick(cell, idx)}>
              <span class="help-icon" style={iconStyle} />
              <strong class="help-title">{cell.title}</strong>
              <span class="help-desc">{cell.desc}</span>
            </div>,
          );
        } else {
          nodes.push(<div class="td empty" key={cellKey}></div>);
        }
      }
      return nodes;
    });

    function onClick(cell, idx) {
      emit('open', cell, idx);
    }

    return {
      tdNodes,
    };
  },
  render() {
    return <div class="tr">{this.tdNodes}</div>;
  },
});

export const HelpTable = defineComponent({
  name: 'HelpTable',
  props: {
    list: { type: Array as PropType<ListType>, required: true },
    colCount: { type: Number, required: true },
    iconB64List: { type: Array, required: true },
    modelData: { type: Object as PropType<modelDataType>, required: true },
  },
  emits: ['open'],
  setup(props, { emit }) {
    const trNodes = computed(() => {
      const nodes: VNode[] = [];
      for (let i = 0; i < Math.ceil(props.list.length / props.colCount); i++) {
        nodes.push(<HelpRow key={`help-row-${i}`} list={props.list} rowIndex={i} colCount={props.colCount} iconB64List={props.iconB64List} modelData={props.modelData} onOpen={onOpen} />);
      }
      return nodes;
    });

    function onOpen(cell, cellIndex) {
      emit('open', cell, cellIndex);
    }

    return {
      trNodes,
    };
  },
  render() {
    return <div class="help-table">{this.trNodes}</div>;
  },
});
