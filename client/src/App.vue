<template>
  <div id="app" class="flex flex-wrap items-center">
    
    <el-dropdown split-button type="primary" style="float: left;" @click="handleClick">
      导入
      <el-icon class="el-icon--right"><Upload /></el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>Action 1</el-dropdown-item>
          <el-dropdown-item>Action 2</el-dropdown-item>
          <el-dropdown-item>Action 3</el-dropdown-item>
          <el-dropdown-item>Action 4</el-dropdown-item>
          <el-dropdown-item>Action 5</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    
    <div style="text-align: right;">
  <el-button type="primary" style="margin-right: 0;">
    <el-icon style="vertical-align: middle;">
      <check />
    </el-icon>
    <span style="vertical-align: middle; margin-left: 5px;">保存</span>
  </el-button>
</div>

  <div>
    <div style="text-align: -webkit-center">
  <el-form ref="ruleForm" label-width="100px" style="width: max-content">
    <el-form-item label-width="0">
      <label for="inputField" style="font-size: 24px; margin-right: 20px;">标题：</label>
      <input type="text" id="inputField" v-model="inputValue" @input="handleInput" style="font-size: 24px; padding: 10px;" />
    </el-form-item>
  </el-form>
</div>

    <!--使用标题的时候无法使用编辑器的工具-->
  </div>
    <div style="border: 1px solid #ccc; margin-top: 10px">
      <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        style="border-bottom: 1px solid #ccc"
      />
      <Editor
        :defaultConfig="editorConfig"
        :mode="mode"
        v-model="valueHtml"
        style="height: 400px; overflow-y: hidden"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onDestroyed="handleDestroyed"
        @onFocus="handleFocus"
        @onBlur="handleBlur"
        @customAlert="customAlert"
        @customPaste="customPaste"
      />
    </div>
    <div id="app">
      <div>
    <button @click="showDrawer = true">打开评论区</button>
    <div class="drawer-mask" v-if="showDrawer" @click="showDrawer = false"></div>
    <div class="drawer" :style="{ right: showDrawer ? 0 : '-100%' }">
      <h3>评论区</h3>
      <div>
        <h4>评论列表</h4>
        <ul>
          <li v-for="(comment, index) in comments" :key="index">
            {{ comment }}
            <el-button @click="replyTo(index)"  circle icon = "Message">回复</el-button>
            <el-button @click="replyTo(index)"  circle icon = "Star">收藏</el-button>
            <ul v-if="replyIndex === index">
              <li v-for="(reply, rIndex) in comment.replies" :key="rIndex">
            {{ reply }}
              </li>
              <li><input v-model="newReply" placeholder="输入回复内容" /></li>
              <li><button @click="addReply">提交回复</button></li>
            </ul>
          </li>
        </ul>
      </div>
      <div>
        <h4>发表评论</h4>
        <div><input v-model="newComment" placeholder="输入评论内容" /></div>
        <div><button @click="addComment">提交评论</button></div>
      </div>
    </div>
  </div>
  </div>
      <el-button type="primary" style="float:right">
        查看编辑历史<el-icon class="el-icon--right" ><ArrowRight /></el-icon>
      </el-button>
      <el-button type="primary" style="float:right">
        文本渲染页面<el-icon class="el-icon--right" ><ArrowRight /></el-icon>
      </el-button>
      
  </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css';
import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
export default {
  components: { Editor, Toolbar },
  data() {
    return {
      showDrawer: false,
      comments: [],
      newComment: '',
      replyIndex: -1,
      newReply: '',
      drawerVisible: false,
    };
  },
  methods: {
    addComment() {
      if (this.newComment) {
        this.comments.push({
          content: this.newComment,
          reply: [],//这里要改成直接显示评论内容 无需显示键值对
        });
        this.newComment = '';
      }
    },
    replyTo(index) {
      this.replyIndex = this.replyIndex === index ? -1 : index;
    },
    addReply() {
      
        const comment = this.comments[this.replyIndex];
      comment.replies.push(this.newReply);
      this.newReply = "";
      this.replyIndex = -1;
      
    },
  },
    handleInput(event) {
      this.inputValue = event.target.value;
    },
    addComment(index = -1) {
      if (!this.newComment.body.trim()) {
        return
      }
      this.newComment.date = new Date().toLocaleString()
      if (index === -1) {
        this.comments.push({...this.newComment, replies: []})
      } else {
        this.comments[index].replies.push({...this.newComment})
      }
      this.newComment.body = ''
      this.drawerVisible = false;
    },
    toggleReply(index) {
      if (this.replyIndex === index) {
        this.replyIndex = -1
      } else {
        this.replyIndex = index
      }
    },
    addReply(index) {
      this.addComment(index)
      this.replyIndex = -1
    },
    isReplying(index) {
      return this.replyIndex === index
    },
  
  setup() {
    // 编辑器实例，必须用 shallowRef，重要！
    const editorRef = shallowRef();
    
    // 内容 HTML
    const valueHtml = ref('<p>hello</p>');

    // 模拟 ajax 异步获取内容
    onMounted(() => {
      setTimeout(() => {
        valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>';
      }, 1500);
    });

    const toolbarConfig = {};
    const editorConfig = { placeholder: '请输入内容...' };

    // 组件销毁时，也及时销毁编辑器，重要！
    onBeforeUnmount(() => {
      const editor = editorRef.value;
      if (editor == null) return;

      editor.destroy();
    });

    // 编辑器回调函数
    const handleCreated = (editor) => {
      console.log('created', editor);
      editorRef.value = editor; // 记录 editor 实例，重要！
    };
    const handleChange = (editor) => {
      console.log('change:', editor.getHtml());
    };
    const handleDestroyed = (editor) => {
      console.log('destroyed', editor);
    };
    const handleFocus = (editor) => {
      console.log('focus', editor);
    };
    const handleBlur = (editor) => {
      console.log('blur', editor);
    };
    const customAlert = (info, type) => {
      alert(`【自定义提示】${type} - ${info}`);
    };
    const customPaste = (editor, event, callback) => {
      console.log('ClipboardEvent 粘贴事件对象', event);

      // 自定义插入内容
      editor.insertText('xxx');

      // 返回值（注意，vue 事件的返回值，不能用 return）
      callback(false); // 返回 false ，阻止默认粘贴行为
      // callback(true) // 返回 true ，继续默认的粘贴行为
    };

    const insertText = () => {
      const editor = editorRef.value;
      if (editor == null) return;

      editor.insertText('hello world');
    };

    const printHtml = () => {
      const editor = editorRef.value;
      if (editor == null) return;
      console.log(editor.getHtml());
    };

    const disable = () => {
      const editor = editorRef.value;
      if (editor == null) return;
      editor.disable()
    };

    return {
      editorRef,
      mode: 'default',
      valueHtml,
      toolbarConfig,
      editorConfig,
      handleCreated,
      handleChange,
      handleDestroyed,
      handleFocus,
      handleBlur,
      customAlert,
      customPaste,
      insertText,
      printHtml,
      disable
    };
  },
};
</script>
<style>
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 300px;
  right: -100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  transition: right 0.3s;
  padding: 10px;
}
</style>
