const mysql = require('mysql');

// 连接数据库
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'test',
  password: '@Testing01',
  database: 'rich_text_editor'
});

const pool = mysql.createPool({
  host: 'localhost',
  user: 'test',
  password: '@Testing01',
  database: 'rich_text_editor'
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to database: ' + error.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
});

// 获取文章列表
function getTexts(callback) {
  connection.query('SELECT id, title, created_at, updated_at FROM text', (error, results, fields) => {
    if (error) throw error;
    callback(results);
  });
}

function getArticle(id, callback) {
  const query = `SELECT title, content FROM text WHERE id = ${id}`;
  connection.query(query, (error, results) => {
    if (error) throw error;

    // 如果找不到该文章，则返回 null
    if (results.length === 0) {
      callback(null);
    } else {
      const article = results[0];
      const { title, content } = article;
      callback({ title, content });
    }
  });
}


function postArticle(req, res) {
  // 获取文章标题和内容，这里假设客户端发送的数据是 JSON 格式
  const { title, content } = req.body;

  // 获取文章 ID
  const id = req.query.id;

  // 检查数据库中是否已有该文章 ID 的文章
  pool.query(
    'SELECT * FROM text WHERE id = ?',
    [id],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error checking article');
      } else if (results.length > 0) {
        // 数据库中已有该文章 ID 的文章，更新 text 表中的数据并新增 text_history 表中的数据
        pool.query(
          'UPDATE text SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [title, content, id],
          (error, results, fields) => {
            if (error) {
              console.error(error);
              res.status(500).send('Error updating article');
            } else {
              pool.query(
                'INSERT INTO text_history (text, article_id) VALUES (?, ?)',
                [content, id],
                (error, results, fields) => {
                  if (error) {
                    console.error(error);
                    res.status(500).send('Error saving article history');
                  } else {
                    const status = "Article saved successfully";
                    const id = req.query.id;
                    res.send({ id, status });
                  }
                }
              );
            }
          }
        );
      } else {
        // 数据库中没有该文章 ID 的文章，插入数据到 text 表中并新增 text_history 表中的数据
        pool.query(
          'INSERT INTO text (id, title, content) VALUES (?, ?, ?)',
          [id, title, content],
          (error, results, fields) => {
            if (error) {
              console.error(error);
              res.status(500).send('Error saving article');
            } else {
              pool.query(
                'INSERT INTO text_history (text, article_id) VALUES (?, ?)',
                [content, id],
                (error, results, fields) => {
                  if (error) {
                    console.error(error);
                    res.status(500).send('Error saving article history');
                  } else {
                    const status = "Article saved successfully";
                    const id = req.query.id;
                    res.send({ id, status });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
}

function getCommentsByArticleId(articleId, callback) {
  //获取文章id的评论列表
  const sql = 'SELECT username,comments,createdAt FROM comments WHERE article_id = ?';
  connection.query(sql, [articleId], (error, results, fields) => {
    if (error) {
      console.error('Error selecting comments from database: ' + error.stack);
      callback(error, null);
      return;
    }
    callback(null, results);
  });
}

function addComment(articleId, username, comment, callback) {
  const sql = 'INSERT INTO comments (article_id, username, comment) VALUES (?, ?, ?)';
  connection.query(sql, [articleId, username, comment], (error, results, fields) => {
    if (error) {
      console.error('Error inserting comment into database: ' + error.stack);
      callback(error, null);
      return;
    }
    const status = 'Comment added successfully'
    callback({ articleId, username, status });
  });
}

module.exports = {
  getTexts, getArticle, postArticle, getCommentsByArticleId, addComment
};
