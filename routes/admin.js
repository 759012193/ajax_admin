const Query = require('./../config/dbHelper');
const express = require('express');
const router =  express.Router();
const md5 = require('blueimp-md5');
const KEY = require('./../config/config').KEY;
const jwt =require('jsonwebtoken')
// 注册主管理员接口
/*
  账户名: admin
  密码: admin 
*/
router.post('/reg', (req, res, next)=>{
    // 1. 获取参数
    const {account, password} = req.body;
    const md5_password = md5(password, KEY);
    console.log(account, md5_password);

    // 2. 验证
    if(!account || !password){
        res.json({
            status: 0,
            msg: '用户名或密码不能为空!'
        });
        return;
    }

    // 3. 插入数据库表
    let sql = `INSERT INTO t_admin(account, password) VALUES (?, ?);`;
    let values = [account, md5_password];
    
    Query(sql, values).then((result)=>{
        res.json({
            status: result.code,
            msg: '注册主管理员成功!'
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '注册主管理员失败!'
        });
    });
});


// 账户登录
router.post('/login', (req, res, next)=>{
    // 1. 获取数据
    const {account, password} = req.body;
    // console.log(account, password);

    // 2. 验证
    if(!account || !password){
        res.json({
            status: 0,
            msg: '用户名或密码不能为空!'
        });
        return;
    }

    // 3. 查询数据库
    let sql = `SELECT * FROM t_admin WHERE account = ? AND password = ?;`;
    let value = [account, md5(password,KEY)];
    Query(sql, value).then((result)=>{
        // console.log(result);
        if(result.data.length > 0){
            // 3.1 取出所有的数据
            const {id, account, password,  account_name, account_icon} = result.data[0];

            // 3.2 生成token
            const userData = {id, account, password};
            const token = jwt.sign(userData, KEY);
            // console.log(token);
            // console.log(jwt.verify(token, KEY));

            console.log(req.socket);
            // 3.3 把token存在session中
            req.session.token = token;

            // 3.3 返回给客户端数据
            res.json({
                status: 1,
                msg: '登录成功!',
                data: {
                    token,
                    account,
                    account_name,
                    account_icon
                }
            })
        }else {
            res.json({
                status: 0,
                msg: '当前账户不存在!'
            })
        }
    }).catch((error)=>{
        console.log(error);
        res.json({
            status: 0,
            msg: '账户名或密码错误!'
        })
    })
});

// 账户退出登录
router.get('/logout', (req, res, next)=>{
    // 方式一
    // req.session.cookie.maxAge = 0;
    // 方式二
    req.session.destroy();

    res.json({
        status: 1,
        msg: '退出登录成功!'
    });
});




module.exports = router;