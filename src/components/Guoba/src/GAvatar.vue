<template>
  <Avatar :src="src" alt="头像" :style="style">
    <template v-if="!id" #icon>
      <qq-outlined />
    </template>
  </Avatar>
</template>

<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { Avatar } from 'ant-design-vue';
  import { QqOutlined } from '@ant-design/icons-vue';
  import { propTypes } from '/@/utils/propTypes';

  export default defineComponent({
    name: 'GAvatar',
    components: { Avatar, QqOutlined },
    props: {
      id: propTypes.oneOfType([propTypes.string, propTypes.number]),
      // user、group
      type: propTypes.oneOf(['user', 'group']).def('user'),
      size: propTypes.number.def(24),
      // QQ头像大小，0、100
      qs: propTypes.number.def(0),
    },
    setup(props) {
      const style = computed(() => {
        const { size } = props;
        if (size) {
          return {
            width: `${size}px`,
            height: `${size}px`,
          };
        }
      });

      const src = computed(() => {
        return props.type === 'user' ? getUserAvatarUrl() : getGroupAvatarUrl();
      });

      function getUserAvatarUrl() {
        return `https://q1.qlogo.cn/g?b=qq&s=${props.qs}&nk=` + props.id;
      }

      function getGroupAvatarUrl(history = 0) {
        return `https://p.qlogo.cn/gh/${props.id}/${props.id}${history ? '_' + history : ''}/` + props.qs;
      }

      return {
        src,
        style,
      };
    },
  });
</script>

<style scoped></style>
