import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

const express = require('express');
const text = require('getTexts.js');

const app = express();

// 处理 GET /articlelist 请求
app.get('/articlelist', (req, res) => {
  text.getTexts((results) => {
    res.send(results);
  });
});

// 启动服务器
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
