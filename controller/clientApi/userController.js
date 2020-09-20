const Query = require('./../../config/dbHelper');
// 引入token生成器
const jwt = require('jsonwebtoken');

const PC_KEY = require('./../../config/config').PC_KEY;

let users = {};

function ResultTemp(status, msg, data) {
    return {
        status,
        msg,
        data
    }
}

/**
 * 注册用户
 */
function regUser(params, callBack) {
    // 1. 获取数据
    const {user_name, user_password, user_phone, phone_code} = params;
    // 2. 容错处理
    if(!user_name || !user_password || !user_phone || !phone_code){
        console.log('------++++', users);
        callBack(ResultTemp(0, '输入的内容不能为空!', {}));
        return;
    }
    // 3. 验证手机验证码
    if(users[user_phone] !== phone_code){
        callBack(ResultTemp(0, '输入的手机验证码不正确!', {}));
        return;
    }

    // 4. 查询当前会员名是否存在
    let sql = `SELECT * FROM t_user WHERE user_name = ?;`;
    let value = [user_name];
    Query(sql, value).then((result)=>{
         // 5. 判断
         if(result.data.length > 0){
             callBack(ResultTemp(0, '会员名称已经存在!', {}));
         }else {
             // 6. 验证手机号码
             let sql1 = `SELECT * FROM t_user WHERE user_phone = ?;`;
             let value1 = [user_phone];
             Query(sql1, value1).then((result1)=>{
                 if(result1.data.length > 1){
                     callBack(ResultTemp(0, '该手机号已经注册, 请直接登录!', {}));
                 }else {
                     // 7. 注册新的用户
                     let sql3 = `INSERT INTO t_user(user_name, user_password,user_phone,user_count_money) VALUES (?, ?, ?, ?); `;
                     let value3 = [user_name, user_password, user_phone, 10000];
                     Query(sql3, value3).then((result)=>{
                         if(result.code === 1){
                             callBack(ResultTemp(1, '注册成功!', {}));
                         }else {
                             callBack(ResultTemp(0, '注册失败!', {}));
                         }
                     }).catch((error)=>{
                         callBack(ResultTemp(error.code, error.msg, error.data));
                     })
                 }
             }).catch((error)=>{
                 callBack(ResultTemp(error.code, error.msg, error.data));
             })
         }
    }).catch((error)=>{
        callBack(ResultTemp(error.code, error.msg, error.data));
    })
}

/**
 *获取手机验证码
*/
function getPhoneCode(phone, callBack) {
    // 1. 验证
    if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(phone)) {
        callBack(ResultTemp(0, '手机号码不正确', {}));
    }

    // 2. 随机产生验证码
    let code = randomCode(6);


    // 3. 模拟返回
    setTimeout(() => {
        users[phone] = code;
        callBack(ResultTemp(1, '验证码获取成功', {code}));
    }, 2000);


}

/**
 *生成指定长度的随机数
*/
function randomCode(length) {
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = '';
    for (let i = 0; i < length; i++) {
        let index = Math.ceil(Math.random() * 9);
        result += chars[index];
    }
    return result;
}

/**
 * 手机登录
 */
function loginUser(params, callBack) {
    // 1. 获取数据
    const {user_phone, user_password} = params;
    // 2. 容错处理
    if(!user_password || !user_phone){
        callBack(ResultTemp(0, '输入的内容不能为空!', {}));
        return;
    }
    // 3. 验证手机
    if(!/^1(3|4|5|6|7|8|9)\d{9}$/.test(user_phone)){
        callBack(ResultTemp(0, '输入的手机号码不正确!', {}));
        return;
    }
    // 4. 查询数据库
    let sql = `SELECT * FROM t_user WHERE user_phone = ? LIMIT 1;`;
    let value = [user_phone];
    console.log(user_phone,user_password);
    Query(sql, value).then((result)=>{
        // 5. 判断
        console.log(result);
        if(result.data.length > 0){
            // 6. 取出密码对比
            let pwd = result.data[0].user_password;
            if(user_password === pwd){ // 登录成功
                // 7. 生成token
                console.log("登录成功！")
                console.log(result.data)
                const {id, user_name, user_password, user_phone, user_count_money, user_intro, user_icon} = result.data[0];
                const userData = {id, user_name, user_password};
                console.log(userData);
                console.log(PC_KEY);
                const token = jwt.sign(userData, PC_KEY);
                console.log(token+"token");
                // 8. 给客户端返回数据
                callBack(ResultTemp(1, '登录成功!', {token, id, user_name, user_phone, user_count_money, user_intro, user_icon}));
            }else {
                callBack(ResultTemp(0, '输入密码不正确!', {}));
            }
        }else {
            callBack(ResultTemp(0, '当前手机号没有注册!', {}));
        }
    }).catch((error)=>{
        callBack(ResultTemp(error.code, error.msg, error.data));
    })

}

/**
 * 验证重置密码的手机验证码
 */
function rightPhoneCode(params, callBack){
    const {user_phone, phone_code} = params;

    if(!/^1(3|4|5|6|7|8|9)\d{9}$/.test(user_phone)){
        callBack(ResultTemp(0, '输入的手机号码不正确!', {}));
        return;
    }

    if(users[user_phone] !== phone_code){
        callBack(ResultTemp(0, '输入的手机验证码不正确!', {}));
    }else {
        callBack(ResultTemp(1, '手机验证码正确!', {}));
    }
}

/**
 * 重置密码
 */
function resetPassword(params, callBack){
    const {user_phone, user_password} = params;
    // 2. 容错处理
    if(!user_password || !user_phone){
        callBack(ResultTemp(0, '输入的内容不能为空!', {}));
        return;
    }
    // 3. 验证手机
    if(!/^1(3|4|5|6|7|8|9)\d{9}$/.test(user_phone)){
        callBack(ResultTemp(0, '输入的手机号码不正确!', {}));
        return;
    }
    // 4. 查询数据库
    let sql = `SELECT * FROM t_user WHERE user_phone = ? LIMIT 1`;
    let value = [user_phone];
    Query(sql, value).then((result)=>{
        // 5. 判断
        if(result.data.length > 0){
            let sql2 = `UPDATE t_user SET user_password=? WHERE user_phone=?`;
            let value2 = [user_password, user_phone];
            Query(sql2, value2).then((result)=>{
                callBack(ResultTemp(1, '重置密码成功, 请重新登录!', {}));
            }).catch((error)=>{
                callBack(ResultTemp(error.code, error.msg, error.data));
            })
        }else {
            callBack(ResultTemp(0, '当前手机号没有注册!', {}));
        }
    }).catch((error)=>{
        callBack(ResultTemp(error.code, error.msg, error.data));
    })
}


/**
 *  获取当前用户收藏的资源
 */
function getUserResource(user_id, callBack) {
    if(user_id){
        let sql = `SELECT resource_id FROM t_user_fav WHERE user_id = ?;`;
        let value = [user_id];
        Query(sql, value).then((result)=>{
            callBack(ResultTemp(result.code, '获取收藏的资源成功!', result.data));
        }).catch((error)=>{
            callBack(ResultTemp(error.code, '获取收藏的资源失败!', error.data));
        })
    }else {
        callBack(ResultTemp(0, '查询的条件不能为空!', {}));
    }
}

/*
  用户收藏和取消收藏
*/
function userFavResource(params, callBack) {
    const {user_id, resource_id} = params;
    if(!user_id || !resource_id){
        callBack(ResultTemp(0, '操作参数不完整!', {}));
        return;
    }
    // 1. 查询是否已经收藏该资源
    let sql = `SELECT * FROM t_user_fav WHERE user_id=? AND resource_id=?`;
    let value = [user_id, resource_id];
    Query(sql, value).then((result)=>{
        if(result && result.code === 1){
            if(result.data.length > 0){ // 已经收藏, 则取消收藏
                let sql1 = `DELETE FROM t_user_fav WHERE user_id=? AND resource_id=?`;
                let value1 = [user_id, resource_id];
                Query(sql1, value1).then((result)=>{
                    if(result && result.code === 1){ // 操作成功
                        callBack(ResultTemp(1,  "取消收藏成功!",{}));
                    }else {
                        callBack(ResultTemp(0,  "取消收藏失败!",{}));
                    }
                }).catch((error)=>{
                    callBack(ResultTemp(error.code,  error.msg, error.data));
                })
            }else { // 没有收藏, 则收藏
                let sql2 = `INSERT INTO t_user_fav(user_id, resource_id) VALUES(?, ?);`;
                let value2 = [user_id, resource_id];
                Query(sql2, value2).then((result)=>{
                    if(result && result.code === 1){ // 操作成功
                        callBack(ResultTemp(1,  "收藏成功!",{}));
                    }else {
                        callBack(ResultTemp(0,  "收藏失败!",{}));
                    }
                }).catch((error)=>{
                    callBack(ResultTemp(error.code,  error.msg, error.data));
                })
            }
        }else {
            callBack(ResultTemp(0,  "操作失败!",{}));
        }
    }).catch((error)=>{
        callBack(ResultTemp(error.code,  error.msg, error.data));
    })

}

/*
  判断用户是否已经购买了该资源
*/
function userIsBuyResource(params, callBack){
    const {user_id, resource_id} = params;
    let sql = `SELECT * FROM t_user_resource WHERE user_id=? AND resource_id=?;`;
    let value = [user_id, resource_id];
    Query(sql, value).then((result)=>{
        if(result && result.code === 1){
            if(result.data.length > 0){
                callBack(ResultTemp(1, '该资源已经购买!', {}));
            }else{
                callBack(ResultTemp(0, '该资源尚未购买!', {}));
            }
        }else {
            callBack(ResultTemp(0, '该资源尚未购买!', {}));
        }
    }).catch((error)=>{
        callBack(ResultTemp(0, '服务器内部错误', {}));
    })
}

/*
  用户购买资源
*/
function userBuyResource(params, callBack){
    const {token, user_id, resource_id, resource_price, time} = params;
    // 0. 验证参数合法性
    if(!token || !user_id || !resource_id || !resource_price || !time){
        callBack(ResultTemp(0, '传递参数不完整!', {}));
        return;
    }

    // 1. 验证用户的合法性
    let userObj = jwt.verify(token, PC_KEY);
    if(userObj && userObj.id === user_id){ // 用户验证通过
        // 2. 对比价格
        let sql = `SELECT resource_price FROM t_resource WHERE id=?;`;
        let value = [resource_id];
        Query(sql, value).then((result)=>{
            if(result.data.length>0){
                if(result.data[0].resource_price === resource_price){ // 价格一致
                     // 3. 从该用户的账户扣除该费用
                     let sql1 = `UPDATE t_user SET user_count_money = user_count_money - ? WHERE id=?;`;
                     let value1 = [resource_price, user_id];
                     Query(sql1, value1).then((result1)=>{
                          if(result1 && result1.code===1){ // 扣款成功
                               // 4. 记录流水
                              let sql2 = `INSERT INTO t_user_account(user_id, account_change_time, account_change_money, account_change_method) VALUES (?, ?, ?, ?)`;
                              let value2 = [user_id, time, resource_price, 1];
                              Query(sql2, value2).then((result2)=>{
                                   if(result2 && result2.code === 1){ // 生成流水成功
                                       // 5. 记录该资源被购买
                                       let sql3 = `INSERT INTO t_user_resource(user_id, resource_id) VALUES (?, ?)`;
                                       let value3 = [user_id, resource_id];
                                       Query(sql3, value3).then((result3)=>{
                                           if(result3 && result3.code===1){
                                               // 6. 更新购买资源的数量
                                               let sql4 = `UPDATE t_resource SET buy_count = buy_count + 1 WHERE id = ?`;
                                               let value4 = [resource_id];
                                               Query(sql4, value4).then((result4)=>{
                                                    if(result4 && result4.code===1){
                                                        callBack(ResultTemp(1, '扣款成功, 生成流水成功, 记录购买操作成功, 更新资源购买数量成功!', {}));
                                                    }else {
                                                        callBack(ResultTemp(0, '扣款成功, 生成流水成功, 记录购买操作成功, 更新资源购买数量失败!', {}));
                                                    }
                                               }).catch(()=>{
                                                   callBack(ResultTemp(0, '服务器内部错误!', {}));
                                               })
                                           }else {
                                               callBack(ResultTemp(0, '扣款成功, 生成流水成功, 记录购买操作失败!', {}));
                                           }
                                       }).catch(()=>{
                                           callBack(ResultTemp(0, '服务器内部错误!', {}));
                                       })
                                   }else {
                                       callBack(ResultTemp(0, '扣款成功, 生成流水失败!', {}));
                                   }
                              }).catch(()=>{
                                  callBack(ResultTemp(0, '服务器内部错误!', {}));
                              })
                          }else {
                              callBack(ResultTemp(0, '服务器内部错误!', {}));
                          }
                     }).catch(()=>{
                         callBack(ResultTemp(0, '服务器内部错误!', {}));
                     });
                }else {
                    callBack(ResultTemp(0, '该资源的价格传递错误!', {}));
                }
            }else {
                callBack(ResultTemp(0, '要购买的资源不存在!', {}));
            }
        }).catch(()=>{
            callBack(ResultTemp(0, '服务器内部错误!', {}));
        })

    }else {// 用户验证不通过
        callBack(ResultTemp(0, '非法用户!', {}));
    }
}


/*
  获取用户信息
*/
function getUserInfo(user_id, callBack){
    if(user_id){
        let sql = `SELECT user_name, user_phone, user_count_money, user_intro, user_icon FROM t_user WHERE id=?;`;
        let value = [user_id];
        Query(sql, value).then((result)=>{
            callBack(ResultTemp(1, '获取用户信息成功!', result.data));
        }).catch((error)=>{
            callBack(ResultTemp(0, '获取用户信息失败!', {}));
        })
    }else {
        callBack(ResultTemp(0, '查询条件不能为空!', {}));
    }
}


/*
  用户更新头像
*/
function userUpdateIcon(params, callBack){
    const {user_id, icon_url} = params;
    if(!user_id || !icon_url){
        callBack(ResultTemp(0, '操作参数不完整!', {}));
        return;
    }

    let sql = `UPDATE t_user SET user_icon=? WHERE id=?`;
    let value = [icon_url, user_id];
    Query(sql, value).then((result)=>{
        if(result && result.code === 1){
            callBack(ResultTemp(1, '头像更新成功!', {}));
        }else {
            callBack(ResultTemp(0, '头像更新不成功!', {}));
        }
    }).catch((error)=>{
        callBack(ResultTemp(0, '服务器内部错误', {}));
    })

}

/*
  用户更新签名
*/
function userUpdateIntro(params, callBack){
    const {user_id, user_intro} = params;
    if(!user_id || !user_intro){
        callBack(ResultTemp(0, '操作参数不完整!', {}));
        return;
    }

    let sql = `UPDATE t_user SET user_intro=? WHERE id=?`;
    let value = [user_intro, user_id];
    Query(sql, value).then((result)=>{
        if(result && result.code === 1){
            callBack(ResultTemp(1, '签名更新成功!', {}));
        }else {
            callBack(ResultTemp(0, '签名更新不成功!', {}));
        }
    }).catch((error)=>{
        callBack(ResultTemp(0, '服务器内部错误', {}));
    })

}


/*
  获取用户购买的资源
*/
function getUserBuyResource(params, callBack){
    const {page_num, page_size, user_id} = params;
   // 1. 处理页码
   let pageNum =  page_num || 1;
   let pageSize =  page_size || 4;

   if(user_id){
       let sql1 = `SELECT COUNT(*) as user_resource_count FROM t_user_resource WHERE user_id = ?;`;
       let sql2 = `SELECT t_resource.* FROM t_user_resource LEFT JOIN t_resource ON t_user_resource.resource_id = t_resource.id WHERE t_user_resource.user_id = ? LIMIT ${(pageNum - 1) * pageSize}, ${pageSize}`;
       let value = [user_id];
       Query(sql1, value).then((result1)=>{
           Query(sql2, value).then((result2)=>{
               let data = {};
               data.user_resource_count = result1.data[0].user_resource_count;
               data.user_resource_list = result2.data;
               callBack(ResultTemp(result2.code, '获取成功', data));
           }).catch((error)=>{
               callBack(ResultTemp(error.code, error.msg, error.data));
           })
       });
   }else {
       callBack(ResultTemp(0, '操作参数不完整!', {}));
   }
}


/*
  获取用户购买的流水
*/
function getUserAccountList(params, callBack){
    const {page_num, page_size, user_id} = params;
    // 1. 处理页码
    let pageNum =  page_num || 1;
    let pageSize =  page_size || 4;

    if(user_id){
        let sql1 = `SELECT COUNT(*) as account_count FROM t_user_account WHERE user_id = ?;`;
        let sql2 = `SELECT * FROM t_user_account WHERE user_id = ? ORDER BY id DESC LIMIT ${(pageNum - 1) * pageSize}, ${pageSize}`;
        let value = [user_id];
        Query(sql1, value).then((result1)=>{
            Query(sql2, value).then((result2)=>{
                let data = {};
                data.account_count = result1.data[0].account_count;
                data.account_list = result2.data;
                callBack(ResultTemp(result2.code, '获取成功', data));
            }).catch((error)=>{
                callBack(ResultTemp(error.code, error.msg, error.data));
            })
        });
    }else {
        callBack(ResultTemp(0, '操作参数不完整!', {}));
    }
}

module.exports = {
    getPhoneCode,
    regUser,
    loginUser,
    rightPhoneCode,
    resetPassword,
    getUserResource,
    userFavResource,
    userIsBuyResource,
    userBuyResource,
    getUserInfo,
    userUpdateIcon,
    userUpdateIntro,
    getUserBuyResource,
    getUserAccountList
};
