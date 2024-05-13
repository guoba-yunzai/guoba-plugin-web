<template>
  <Modal v-model:visible="uploader.show" width="420px" :closable="false" :footer="null">
    <div class="frame">
      <VuePictureCropper
        v-if="pic"
        :boxStyle="{
          height: '300px',
          width: '100%',
          backgroundColor: '#f8f8f8',
        }"
        :img="pic"
        :options="{
          viewMode: 1,
          dragMode: 'move',
          aspectRatio: 1,
        }"
      />
      <div v-else>
        <div class="wrap">
          <div>替换</div>
          <div class="icon" :style="`background: url(${iconB64List[uploader.selected]}) 0 0 no-repeat`" />
        </div>
      </div>

      <div class="wrap">
        <input type="file" id="upload1" style="display: none" name="icon" accept="image/bmp,image/jpeg,image/png" />

        <a-button block type="info" @click="select">选择图片</a-button>

        <div v-if="pic">
          <a-button block type="success" @click="submit">确定</a-button>
          <div class="tip">请使图片尽量填满取景框</div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import VuePictureCropper, { cropper } from 'vue-picture-cropper';
  import { Modal, message } from 'ant-design-vue';

  const props = defineProps({
    uploader: Object,
    iconB64List: Array as PropType<string[]>,
  });

  const pic = ref<Nullable<string | ArrayBuffer>>(null);

  const select = () => {
    let btn = document.getElementById('upload1');
    if (btn!.bind === undefined) {
      btn!.bind = true;
      btn!.addEventListener('change', (ev) => {
        let files = ev!.target!.files;
        if (files.size !== 0) {
          let file = files[0];
          let Reader = new FileReader();
          Reader.readAsDataURL(file);
          Reader.onload = () => {
            pic.value = Reader.result;
          };
        }
      });
    }
    btn!.click();
  };

  const submit = () => {
    let selected = props.uploader!.selected;
    cropper.getFile().then((file) => {
      let cvs = document.createElement('canvas');
      cvs.width = 100;
      cvs.height = 100;

      let reader = new FileReader();
      reader.onload = function () {
        let ctx = cvs.getContext('2d')!;
        let newImg = new Image();
        newImg.src = reader.result as string;
        newImg.onload = function () {
          ctx.textAlign = 'center';
          ctx.font = 'bold 14px sans-serif';
          ctx.drawImage(newImg, 0, 0, 80, 80);
          ctx.fillText(selected, 40, 95);
          props.iconB64List![selected] = cvs.toDataURL();
          pic.value = null;
        };
      };
      reader.readAsDataURL(file);
    });
  };

  let btn = document.getElementById('upload1');
</script>

<style scoped>
  .frame {
    width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 10px;
    padding: 10px 0;
    gap: 8px;
    max-width: calc(100vw - 52px);
  }

  .tip {
    padding: 10px;
    text-align: center;
    color: #888888;
  }

  .icon {
    width: 80px;
    height: 80px;
    display: block;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 0 14px #f0f1f5;
  }

  .wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
</style>
