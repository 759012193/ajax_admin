const express = require('express');
const router = express.Router();
const Query = require('./../config/dbHelper');

// 各版块资源总数量统计
/*
 SELECT t1.activities, t2.job, t3.live, t4.resource FROM
(SELECT COUNT(*) activities FROM t_activities) t1,
(SELECT COUNT(*) job FROM t_job) t2,
(SELECT COUNT(*) live FROM t_live) t3,
(SELECT COUNT(*) resource FROM t_resource) t4;
*/
router.get('/source_count', (req, res, next)=>{
   let sql = `SELECT t1.activities, t2.job, t3.live, t4.resource FROM (SELECT COUNT(*) activities FROM t_activities) t1, (SELECT COUNT(*) job FROM t_job) t2, (SELECT COUNT(*) live FROM t_live) t3, (SELECT COUNT(*) resource FROM t_resource) t4;`;
   Query(sql).then((result)=>{
      res.json({
         status: result.code,
         msg: '获取统计数据成功!',
         data: result.data[0]
      });
   }).catch((error)=>{
      res.json({
         status: error.code,
         msg: '获取统计数据失败!',
         data: error.data
      });
   })
});

// 各业务购买数量统计
/*
 SELECT t1.activities, t2.job, t3.live, t4.resource FROM (SELECT SUM(t_activities.buy_count) activities FROM t_activities) t1, (SELECT SUM(t_job.buy_count) job FROM t_job) t2, (SELECT SUM(t_live.buy_count) live FROM t_live) t3, (SELECT SUM(t_resource.buy_count) resource FROM t_resource) t4;
*/
router.get('/buy_count', (req, res, next)=>{
   let sql = `SELECT t1.activities, t2.job, t3.live, t4.resource FROM (SELECT SUM(t_activities.buy_count) activities FROM t_activities) t1, (SELECT SUM(t_job.buy_count) job FROM t_job) t2, (SELECT SUM(t_live.buy_count) live FROM t_live) t3, (SELECT SUM(t_resource.buy_count) resource FROM t_resource) t4;`;
   Query(sql).then((result)=>{
      res.json({
         status: result.code,
         msg: '获取统计数据成功!',
         data: result.data[0]
      });
   }).catch((error)=>{
      res.json({
         status: error.code,
         msg: '获取统计数据失败!',
         data: error.data
      });
   })
});


module.exports = router;
