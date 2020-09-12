//1.引入mysql
const mySQL =require('mysql');

//2.引入配置
const dbConfig =require('./config').database;

//3.创建数据库连接池
const pool = mySQL.createPool({
	host:dbConfig.HOST,
	port:dbConfig.PORT,
	user:dbConfig.USER,
	password:dbConfig.PASSWORD,
	database:dbConfig.DATABASE
});
// //4. 创建通用查询方法，返回promise
// let Query=(sql,value)=>{
// 	return new Promise((resolve,reject)=>{
// 		//4.1.建立连接
// 		pool.getConnections((err,connection)=>{
// 			//4.2连接失败
// 			if(error){
// 				reject({code:0,data:error});
// 				return;
// 			}
// 			//4.3连接成功
// 			connection.query(sql,value,(error,result,fields)=>{
// 				//4.4关闭连接
// 				connection.release();
// 				//4.5SQL执行失败
// 				if(error){
// 					reject({code:0,data:error,msg:"SQL执行失败！"});
// 					return;
// 				}
// 				//4.6SQL执行成功
// 				resolve({code:1,data:result,msg:"SQL执行成功！"});
// 			});
// 		});
// 	})
// }


// 4. 创建通用的查询方法, 返回的是promise对象
let Query = (sql, value)=>{
    return new Promise((resolve, reject)=>{
         //  4.1 建立连接
         pool.getConnection((err, connection)=>{
             // 4.2 连接失败
             if(err){
                 reject({code: 0, data: err});
                 return;
             }
             // 4.3 连接成功
             connection.query(sql, value, (error, results, fields)=>{
                 // 4.4 关闭连接
                 connection.release();
                 // 4.5 SQL语句执行失败
                 if(error){
                     reject({code: 0, data: error, msg: 'SQL语句执行失败!'});
                     return;
                 }
                 // 4.6 SQL语句执行成功
                 resolve({code: 1, data: results, msg: 'SQL语句执行成功!'});
             });
         });
    });
};
module.exports=Query

