const mysql = require('mysql');

// 连接数据库
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'rich_text_editor'
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

module.exports = {
    getTexts,getArticle
};
