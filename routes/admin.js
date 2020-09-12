const Query = require('./../config/dbHelper');
const express = require('express');
const router =  express.Router();


// 注册主管理员接口
router.post('/reg', (req, res, next)=>{
    // 1. 获取参数
    const {account, password} = req.body;

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
    let values = [account, password];
    Query(sql, values).then((result)=>{
        console.log(result);
        res.json({
            status: result.code,
            msg: '注册主管理员成功!'
        })
    }).catch((error)=>{
        console.log(error);
        res.json({
            status: error.code,
            msg: '注册主管理员失败!'
        });
    });


});

module.exports = router;