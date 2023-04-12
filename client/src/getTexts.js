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

module.exports = {
    getTexts
};
