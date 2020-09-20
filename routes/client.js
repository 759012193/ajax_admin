const express = require('express');
const router = express.Router();

const resourceController = require('./../controller/clientApi/resourceController');
const userController = require('./../controller/clientApi/userController');
const jobController = require('./../controller/clientApi/jobController');

const {client_img_up} = require('./../controller/managerApi/unloadFile');


router.post('/upload_img', client_img_up.single('client_img'), (req, res, next)=>{
    res.json({
        status: 1,
        msg: '图片上传成功',
        data: {
            name: '/uploads/images/client/' + req.file.filename
        }
    })
});



/*--------------职场人生资源板块-------------------*/
// 获取学前教师培训分类
router.get('/job/job_pre', (req, res, next)=>{
    const sql = `SELECT * FROM t_job_pre;`;
    jobController.getMessage(sql, result=>{
        res.send(result);
    });
});

// 获取家园共育培训分类
router.get('/job/job_family', (req, res, next)=>{
    const sql = `SELECT * FROM t_job_family;`;
    jobController.getMessage(sql, result=>{
        res.send(result);
    });
});

// 获取人生资源
router.post('/job/list', (req, res, next)=>{
    jobController.getJobList(req.body, result=>{
        res.send(result);
    });
});

/*--------------职场人生资源板块-------------------*/

/*--------------幼教资源板块-------------------*/
// 获取所属分类
router.get('/resource/r_category', (req, res, next)=>{
    const sql = `SELECT * FROM t_resource_category;`;
    resourceController.getMessage(sql, result=>{
        res.send(result);
    });
});

// 获取所属班级
router.get('/resource/r_classes', (req, res, next)=>{
    const sql = `SELECT * FROM t_resource_classes;`;
    resourceController.getMessage(sql, result=>{
        res.send(result);
    });
});

// 获取所属区域
router.get('/resource/r_area', (req, res, next)=>{
    const sql = `SELECT * FROM t_resource_area;`;
    resourceController.getMessage(sql, result=>{
        res.send(result);
    });
});

// 获取所属格式
router.get('/resource/r_format', (req, res, next)=>{
    const sql = `SELECT * FROM t_resource_format;`;
    resourceController.getMessage(sql, result=>{
        res.send(result);
    });
});

// 获取所属分类
router.get('/resource/r_meta', (req, res, next)=>{
    const sql = `SELECT * FROM t_resource_meta;`;
    resourceController.getMessage(sql, result=>{
        res.send(result);
    });
});

// 根据条件获取资源列表
router.post('/resource/list', (req, res, next)=>{
    resourceController.getResourceList(req.body, result=>{
        res.send(result);
    });
});

// 根据tag获取资源文件列表
router.get('/resource/file', (req, res, next)=>{
    resourceController.getResourceDownloadList(req.query.tag, result=>{
        res.send(result);
    });
});

// 更新资源的阅读数据
router.get('/resource/views', (req, res, next)=>{
    resourceController.updateResourceViewCount(req.query.resource_id, result=>{
        res.send(result);
    });
});

/*--------------幼教资源板块-------------------*/

/*--------------用户板块-------------------*/
router.get('/user/phone_code', (req, res, next)=>{
    userController.getPhoneCode(req.query.phone, result => {
        res.send(result);
    })
});

router.post('/user/reg', (req, res, next)=>{
    userController.regUser(req.body, result => {
        res.send(result);
    })
});

router.post('/user/login', (req, res, next)=>{
    userController.loginUser(req.body, result => {
        // 在服务器端保存token
        if(result.status === 1){
            req.session.pc_token = result.data.token;
        }
        res.send(result);
    })
});

/*
  退出登录
*/
router.get('/user/logout', (req, res, next)=>{
    req.session.pc_token = null;
    res.send({
        status: 1,
        msg: '退出登录成功!',
        data: {}
    })
});

/*
  获取验证码 和重置密码
*/
router.post('/user/verify_code', (req, res, next)=>{
   userController.rightPhoneCode(req.body, result=>{
       res.send(result);
   });
});

router.post('/user/reset_pwd', (req, res, next)=>{
    userController.resetPassword(req.body, result=>{
        // 重置密码成功
        if(result.status === 1){
            req.session.pc_token = null;
        }
        res.send(result);
    });
});


/*
  获取当前登录用户 收藏的资源
*/
router.get('/user/my_resource', (req, res, next)=>{
    userController.getUserResource(req.query.user_id, (result)=>{
        res.send(result);
    });
});

/*
  收藏 与 取消收藏资源
*/
router.post('/user/fav_resource', (req, res, next)=>{
    userController.userFavResource(req.body, (result)=>{
        res.send(result);
    });
});


/*
 用户是否购买了资源
*/
router.post('/user/is_buy_resource', (req, res, next)=>{
    userController.userIsBuyResource(req.body, (result)=>{
        res.send(result);
    });
});

/*
 用户购买资源
*/
router.post('/user/buy_resource', (req, res, next)=>{
    userController.userBuyResource(req.body, (result)=>{
        res.send(result);
    });
});

/*
获取用户信息
*/
router.get('/user/info', (req, res, next)=>{
    userController.getUserInfo(req.query.user_id, (result)=>{
        res.send(result);
    });
});

/*
用户更新头像
*/
router.post('/user/update_icon', (req, res, next)=>{
    userController.userUpdateIcon(req.body, (result)=>{
        res.send(result);
    });
});


/*
用户更新签名
*/
router.post('/user/update_intro', (req, res, next)=>{
    userController.userUpdateIntro(req.body, (result)=>{
        res.send(result);
    });
});


/*
  获取用户购买的资源
*/
router.post('/user/user_buy_resource', (req, res, next)=>{
    userController.getUserBuyResource(req.body, (result)=>{
        res.send(result);
    });
});


/*
  获取用户购买的资源流水
*/
router.post('/user/user_account_list', (req, res, next)=>{
    userController.getUserAccountList(req.body, (result)=>{
        res.send(result);
    });
});


/*--------------用户板块-------------------*/


module.exports = router;