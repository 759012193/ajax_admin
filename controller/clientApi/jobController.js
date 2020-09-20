const Query = require('./../../config/dbHelper');

function ResultTemp(status, msg, data) {
    return {
        status,
        msg,
        data
    }
}

function getMessage(sql, callBack) {
    Query(sql).then((result) => {
        if (result) {
            callBack(ResultTemp(result.code, '获取成功', result.data));
        } else {
            callBack(ResultTemp(0, '获取失败', {}));
        }
    }).catch((error) => {
        callBack(ResultTemp(error.code, error.msg, error.data));
    })
}

function getJobList(params, callBack) {
    // 1. 处理参数
    const {page_num, page_size, job_pre_edu_id, job_family_edu_id} = params;

    let pageNum = page_num || 1;
    let pageSize = page_size || 4;

    // 2. SQL拼接
    let part1 = job_pre_edu_id !== 0 ? `job_pre_edu_id = ${job_pre_edu_id}`: ``;
    let part2 = job_family_edu_id !== 0 ? `job_family_edu_id = ${job_family_edu_id}`: ``;

    let whereArr = [part1, part2].filter(item=>item.length>0);
    let whereStr = (whereArr.length>0 ? " WHERE ": " ") + whereArr.join(" AND ");


    // 2. 处理SQL语句
    let sql1 = `SELECT COUNT(*) as job_count FROM t_job ${whereStr}`;
    let sql2 = `SELECT * FROM t_job ${whereStr}  LIMIT ${(pageNum - 1) * pageSize}, ${pageSize}`;
    Query(sql1).then((result1)=>{
        Query(sql2).then((result2)=>{
            let data = {};
            data.job_count = result1.data[0].job_count;
            data.job_list = result2.data;
            callBack(ResultTemp(result2.code, '获取成功', data));
        }).catch((error)=>{
            callBack(ResultTemp(error.code, error.msg, error.data));
        })
    });

}

function updateJobViewCount(resource_id, callBack){
   let sql = `UPDATE t_job SET job_views = job_views + 1 WHERE id = ?;`;
   Query(sql, [job_id]).then((result)=>{
       if(result){
           callBack(ResultTemp(1, '更新成功!', {}));
       }
   }).catch((error)=>{
       callBack(ResultTemp(0, '服务端内部错误', {}));
   })
}

module.exports = {
    getMessage,
    getJobList,
    updateJobViewCount
};
