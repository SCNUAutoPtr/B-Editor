const express = require('express');
const text = require('./Texts.js');

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

//处理 GET /article?id=/comments
app.get('/article/comments', (req, res, next) => {
  const articleId = req.query.id;
  getCommentsByArticleId(articleId, (error, results) => {
    if (error) {
      console.error('Error getting comments: ' + error.stack);
      next(error);
      return;
    }
    res.send(results);
  });
});
// 使用 bodyParser 解析请求体数据
app.use(express.json());

// 处理 POST /article?id= 请求
app.post('/article', text.postArticle);

//处理 POST /article?id=/comments 请求
app.post('/article/comments', (req, res, next) => {
  const articleId = req.query.id;
  const username = req.body.username;
  const comment = req.body.comment;
  addComment(articleId, username, comment, (error, result) => {
    if (error) {
      console.error('Error adding comment: ' + error.stack);
      next(error);
      return;
    }
    res.send(result);
  });
});


// 启动服务器
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
