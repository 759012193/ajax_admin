const Query = require('./../config/dbHelper');
const express = require('express');
const router =  express.Router();
const {life_job_up} = require('./../controller/managerApi/unloadFile');

// 上传职场人生封面图, 焦点图, ...
router.post('/upload_life_job', life_job_up.single('job_img'), (req, res, next)=>{
    res.json({
        status: 1,
        msg: '图片上传成功!',
        data: {
            name: '/uploads/images/lifejob/'+ req.file.filename
        }
    })
});

// 获取学前所属分类
router.get('/job_pre', (req, res, next)=>{
    const sql = `SELECT * FROM t_job_pre;`;
    Query(sql).then((result)=>{
        res.json({
            status: result.code,
            msg: '获取学前所属分类成功',
            data: result.data
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: error.msg,
            data: error.data
        })
    });
});

// 获取所属家园分类
router.get('/job_family', (req, res, next)=>{
    const sql = `SELECT * FROM t_job_family;`;
    Query(sql).then((result)=>{
        console.log(result.data);
        res.json({
            status: result.code,
            msg: '获取所属家园分类成功',
            data: result.data
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: error.msg,
            data: error.data
        })
    });
});

// 添加一条人生资源
router.post('/add', (req, res, next)=>{
    // 获取客户端数据
    const {token, job_name, job_img, job_author, job_publish_time, job_content, job_pre_edu_id, job_family_edu_id, focus_img} = req.body;

    console.log(req.body);

    // 验证合法性
    if(req.session.token !== token){
        res.json({
            status: 0,
            msg: '权限出现问题, 无法访问!'
        })
    }else {
        const sql = `INSERT INTO t_job(job_name, job_img, job_author, job_publish_time, job_content, job_pre_edu_id, job_family_edu_id, focus_img) VALUES (?,?,?,?,?,?,?,?);`;
        const values = [job_name, job_img, job_author, job_publish_time, job_content, job_pre_edu_id, job_family_edu_id, focus_img];
        // 插入表
        Query(sql, values).then((result)=>{
            console.log(result);
            if(result.code === 1){
                // 返回给客户端数据
                
                res.json({
                    status: result.code,
                    msg: '新增人生资源成功!',
                    data: {}
                })
            }else {
                res.json({
                    status: 0,
                    msg: '新增人生资源失败!'
                })
            }
        }).catch((error)=>{
            console.log(error);
            res.json({
                status: error.code,
                msg: error.msg,
                data: error.data
            })
        })
    }
});

// 获取人生资源列表
router.get('/list', (req, res, next)=>{
    // 1. 获取页码 和 条数
    let pageNum = req.query.page_num || 1;
    let pageSize = req.query.page_size || 4;

    // 2. SQL语句
    // (pageNum - 1) *  pageSize  ////  pageSize
    let sql1 = `SELECT COUNT(*) as job_count FROM t_job;`;
    let sql2 = `SELECT * FROM t_job LIMIT ${(pageNum - 1) *  pageSize}, ${pageSize};`;

    // 3. 执行SQL
    Query(sql1).then((result1)=>{
        Query(sql2).then((result2)=>{
            res.json({
                status: 1,
                msg: '获取人生资源列表成功!',
                data: {
                    job_count: result1.data[0].job_count, // 人生资源列表总数
                    job_list: result2.data  // 当前页的人生列表
                }
            })
        }).catch((error)=>{
            res.json({
                status: error.code,
                msg: '获取人生列表失败!',
                data: error.data
            })
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '获取人生列表总数失败!',
            data: error.data
        })
    })
});

module.exports = router;
