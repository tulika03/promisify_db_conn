// let config = require("../config/app-config");
// let pool = require('mysql2').createPool(config.database);

// const connection = () => {
//     return new Promise((resolve, reject) => {
//         pool.getConnection((error, tempConnection) => {
//             if(error) reject(error);

//             const query = (sql, binding) => {
//                 return new Promise((resolve, reject) => {
//                     tempConnection.query(sql, binding, (err, result) => {
//                         if(err) reject(err);
//                         resolve(result);
//                     });
//                 });
//             };

//             const release = () => {
//                 return new Promise((resolve, reject) => {
//                     if (error) reject(error);
//                     resolve(tempConnection.release());
//                 })
//             };
//             resolve({query, release});
//         })
//     })
// };

// const query = (sql, binding) => {
//     return new Promise((resolve, reject) => {
//         pool.query(sql, binding, (err, result, fields) => {
//             if (err) reject(err);
//             resolve(result);
//         });
//     });
// }

// module.exports = { pool, connection, query };