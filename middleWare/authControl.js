module.exports = (req, res, next)=>{
    console.log(req.path);
    // 1. 所有非后端相关的接口
    if(req.path && req.path.indexOf('/api/auth/') === -1){
        return next();
    }

    // 2. 所有的都是后端接口 (登录/注册接口放行)
    if(
        req.path.indexOf('/api/auth/admin/login') !== -1 ||
        req.path.indexOf('/api/auth/admin/reg') !== -1
    ){
        return next();
    }

    // 3. 判断登录是否有效
    if(req.session.token){
        return  next();
    }

    // 4. 登录失效  status: 2 登录失效
    if(req.path.indexOf('/api/auth/') !== -1){
        return res.json({
            status: 2,
            msg: '非法访问, 没有权限!'
        })
    }

    // 5. 其它清空
    console.log('other----');

};
