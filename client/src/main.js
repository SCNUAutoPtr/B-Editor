import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

const express = require('express');
const text = require('Texts.js');

const app = express();

// 处理 GET /articlelist 请求
app.get('/articlelist', (req, res) => {
  text.getTexts((results) => {
    res.send(results);
  });
});

// 处理 GET /article?id= 请求
app.get('/article', (req, res) => {
  const articleId = req.query.id;

  text.getArticle(articleId, (data) => {
    if (data === null) {
      res.status(404).send('Article not found');
    } else {
      res.send(data);
    }
  });
});
// 使用 bodyParser 解析请求体数据
app.use(bodyParser.json());

// 处理 POST /article?id= 请求
app.post('/article', text.postArticle);


// 启动服务器
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
