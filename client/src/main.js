import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// 创建数据库连接池
const pool  = mysql.createPool({
  host: 'localhost',
  user: '',
  password: '',
  database: 'rich_text_editor'
});


app.get('/article/:id', (req, res) => {
  const id = req.params.id;
  
  // 从数据库中查询对应文章
  pool.query('SELECT * FROM rich_text_editor WHERE id = ?', [id], (error, results) => {
    if (error) throw error;
    
    // 如果找不到对应文章，返回 404 Not Found
    if (results.length === 0) {
      res.status(404).send('Article not found');
      return;
    }
    
    // 返回文章数据
    const article = results[0];
    const data = {
      id: article.id,
      created_at: article.created_at,
      updated_at: article.updated_at,
      content: article.content,
      comments: article.comments
    };
    res.json(data);
  });
});


// 解析 POST 请求体
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 处理 POST 请求
app.post('/article', (req, res) => {
  const id = req.body.id;
  const content = req.body.content;
  const comments = req.body.comments;

  // 如果请求中包含文章 ID，更新文章数据
  if (id) {
    // 将旧文章数据插入到 text_history 表中
    pool.query('INSERT INTO text_history (text, article_id) SELECT content, id FROM rich_text_editor WHERE id = ?', [id], (error, results) => {
      if (error) throw error;
      
      // 更新文章数据
      pool.query('UPDATE rich_text_editor SET content = ?, comments = ? WHERE id = ?', [content, comments, id], (error, results) => {
        if (error) throw error;

        // 返回更新的数据 ID
        const data = {
          id: id
        };
        res.json(data);
      });
    });
  } else { // 否则插入新数据
    pool.query('INSERT INTO rich_text_editor (content, comments) VALUES (?, ?)', [content, comments], (error, results) => {
      if (error) throw error;

      // 将新文章数据插入到 text_history 表中
      const articleId = results.insertId;
      pool.query('INSERT INTO text_history (text, article_id) VALUES (?, ?)', [content, articleId], (error, results) => {
        if (error) throw error;

        // 返回插入的数据 ID
        const data = {
          id: articleId
        };
        res.json(data);
      });
    });
  }
});

