<template>
  <BasicModal
    @register="registerModal"
    :title="title"
    :width="500"
    @ok="onSubmit"
    @cancel="onCancel"
  >
    <a-spin :spinning="loading">
      <DirectoryTree :treeData="treeData" :loadData="onLoadData" @select="onSelect" />
    </a-spin>
    <template #footer>
      <a-row type="flex" justify="space-between">
        <a-col>
          <a-button type="primary" :disabled="!currentNode" @click="onCreate">创建新目录</a-button>
        </a-col>
        <a-col>
          <a-button @click="onCancel">取消</a-button>
          <a-button type="primary" @click="onSubmit">确定</a-button>
        </a-col>
      </a-row>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Tree } from 'ant-design-vue';
  import { defHttp } from '/@/utils/http/axios';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  enum Api {
    rootFileUrl = '/sys/fs/tree/root',
    fileTreeUrl = '/sys/fs/tree/children',
  }

  const DirectoryTree = Tree.DirectoryTree;
  const emit = defineEmits(['select', 'register']);

  const loading = ref(true);
  const treeData = ref<any[]>([]);
  const selectedKey = ref('');
  const currentNode = ref();

  const title = ref('');

  const [registerModal, { closeModal }] = useModalInner(async (props) => {
    title.value = props.title;
    if (treeData.value.length === 0) {
      loadRoot();
    }
  });

  function onSubmit() {
    if (currentNode.value) {
      emit('select', currentNode.value.dataRef.path);
    }
    closeModal();
  }

  function onCancel() {
    closeModal();
  }

  async function loadRoot() {
    try {
      loading.value = true;
      treeData.value = await defHttp.get({ url: Api.rootFileUrl });
    } finally {
      loading.value = false;
    }
  }

  async function onLoadData(treeNode) {
    if (treeNode.dataRef.children) {
      return;
    }
    loadChildren(treeNode.dataRef.path, treeNode);
  }

  function onSelect(selectedKeys, { node }) {
    selectedKey.value = selectedKeys[0];
    currentNode.value = node;
  }

  function onCreate() {
    if (currentNode.value) {
      loading.value = true;
      try {
        loadChildren(currentNode.value.dataRef.path, currentNode.value);
      } finally {
        loading.value = false;
      }
    }
  }

  async function loadChildren(path, node) {
    let params = { path };
    node.dataRef.children = await defHttp.get({ url: Api.fileTreeUrl, params });
    treeData.value = [...treeData.value];
  }
</script>

<style scoped></style>
