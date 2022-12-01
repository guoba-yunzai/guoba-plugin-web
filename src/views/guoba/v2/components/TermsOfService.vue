<template>
  <div class="terms-box">
    <p style="text-indent: 0">亲爱的V2云崽用户： </p>
    <p>
      你好！由于V2版本云崽已经停止维护，故锅巴插件经过深思熟虑后，决定将不会支持V2版本的云崽，但会增加“迁移”功能，欢迎使用！
    </p>
    <h3> 一、迁移功能介绍</h3>
    <p>“迁移”包含以下功能：</p>
    <ol>
      <li>自动通过Gitee或Github克隆最新云崽仓库</li>
      <li>迁移用户绑定的Cookie</li>
      <li>迁移用户获取的抽卡记录</li>
      <li>迁移用户获取的札记数据</li>
      <li>迁移用户添加的表情、词条</li>
      <li>
        迁移基础配置<br />
        包括：机器人账号密码登录设备、redis配置、主人QQ号、日志等级、chromium其他路径、自动添加好友、禁用私聊以及提示、黑名单QQ号、黑名单群号、cookie文档
      </li>
      <li>迁移机器人公共cookie</li>
      <li>迁移米游社公告推送配置</li>
      <li>迁移群聊默认配置、单独配置</li>
      <li>迁移group_id绑定关系（需操作redis）<br />这个主要是"#添加"功能在私聊时使用</li>
      <li>迁移喵喵插件的面板数据（如果有）</li>
      <li>迁移成就插件的成就数据（如果有）</li>
      <li>迁移经检测不存在兼容性问题的插件（不一定准确）</li>
      <li>
        清理redis<br />
        删除所有以'Yunzai:*'和'genshin:*'为开头的redis缓存，不用担心，这些都是v2的数据，删掉了对v3没有影响，但如果你要保留v2的数据，就不要勾选清理redis选项。
      </li>
      <li>清理垃圾文件</li>
      <li>
        可选择使用npm或pnpm或cnpm或yarn来安装依赖<br />
        如果以上选择的工具没有安装，会自动安装，并设为国内淘宝镜像，加快访问速度
      </li>
      <li>
        安装喵喵插件所需的依赖（image-size）<br />
        仅支持喵喵插件，其他插件如缺少依赖请自行安装
      </li>
    </ol>
    <h3>二、迁移功能免责声明</h3>
    <p>
      在正式发布前，“迁移”功能已经测试过数次，且本人也是通过该功能升级的V3，目前没有发现问题，请放心使用。以下条款仅仅是防止有人恶意利用该功能搞事的。
    </p>
    <ol>
      <li>
        锅巴只提供方便的图形化操作界面和配置迁移的补充，实际上云崽本身就提供了老版本的兼容升级功能。
      </li>
      <li>
        正常情况下，“迁移”功能将会稳定运行，除非使用了可能会导致迁移出错的插件或者错误的配置。<br />
        迁移过程中并不会删除任何文件，所以理论上即使失败了也不会有影响原来的功能，但为了以防万一，在迁移之前请务必做好备份。
      </li>
      <li>
        当迁移过程中或迁移结束后出现错误：
        <ul>
          <li>若是锅巴本身导致的问题，请前往插件项目地址发起ISSUE，经确认后将会尽快修复。</li>
          <li>若是插件导致的不兼容或者其他问题，请自行解决。</li>
        </ul>
      </li>
      <li>若因操作不当或其他原因导致的致命性错误，锅巴插件概不负责，请做好备份工作。</li>
      <li>最终解释权归锅巴插件所有。</li>
    </ol>
    <h3>三、特别鸣谢</h3>
    <ol>
      <li>迁移功能借鉴了 @cvs 写的“一键升级（V2一键上V3）”插件</li>
    </ol>
    <p style="text-indent: 0; text-align: right">锅巴插件<br />2022-11-30</p>
  </div>

  <div class="footer">
    <a-button type="primary" @click="emit('ok')">同意以上条款并开始使用</a-button>
  </div>
</template>

<script lang="ts" setup>
  const emit = defineEmits(['ok']);
</script>

<style scoped lang="less">
  .footer {
    text-align: center;
    border-top: 1px solid #e0e0e0;
    padding: 8px 0;
  }

  .terms-box {
    //height: 100%;
    max-height: 600px;
    overflow-y: auto;
    padding: 12px;

    @media screen and (max-width: @screen-md) {
      max-height: calc(100% - 48px);
    }

    p {
      text-indent: 2em;
    }

    h2 {
      display: block;
      font-size: 1.5em;
      margin-block-start: 0.83em;
      margin-block-end: 0.83em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      font-weight: bold;
    }

    h3 {
      display: block;
      font-size: 1.17em;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      font-weight: bold;
    }

    h4 {
      display: block;
      margin-block-start: 1.33em;
      margin-block-end: 1.33em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      font-weight: bold;
    }

    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      padding-inline-start: 40px;
    }

    ul {
      display: block;
      list-style-type: disc;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      padding-inline-start: 40px;
    }
  }
</style>
