require('dotenv').config(); // this is important!

let config = function () {
    switch (process.env.NODE_ENV) {
        case 'local': return {
            database: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                connectionLimit: 100,
                multipleStatements: true
            },
            port: '3002',
            timeout: 20000,
            swaggerHost: 'localhost:3002',
            secretKey: process.env.SEC_KEY,
            refresh_secret_key: process.env.REF_SEC_KEY
        };
 
};
}
module.exports = new config();