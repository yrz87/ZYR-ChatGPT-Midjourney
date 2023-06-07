import mysql from 'mysql2/promise'
// 创建 MySQL 数据库连接池
const pool = mysql.createPool({
  host: '38.34.244.38',
  port: 3306,
  user: 'chatgpt',
  password: 'xfDwdM5S6SaWfXhj',
  database: 'chatgpt', // 所连接的数据库名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// 测试数据库连接
// pool.getConnection()
//   .then(connection => {
//     console.log('Connected to MySQL database.');
//     connection.release();
//   })
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });

// 测试数据库连接
// async function getConnection() {
//   return await pool.getConnection()
//   .then(connection => {
//     console.log('Connected to MySQL database.');
//     connection.release();
//   })
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });
// }
async function getConnection() {
  return await pool.getConnection()
}
export function disconnect() {
  pool.end()
}
export { getConnection }
