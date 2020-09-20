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

function getResourceList(params, callBack) {
    // 1. 处理参数
    const {page_num, page_size, resource_category_id, resource_classes_id, resource_area_id, resource_meta_id, resource_format_id} = params;

    let pageNum = page_num || 1;
    let pageSize = page_size || 4;

    // 2. SQL拼接
    let part1 = resource_category_id !== 0 ? `resource_category_id = ${resource_category_id}`: ``;
    let part2 = resource_classes_id !== 0 ? `resource_classes_id = ${resource_classes_id}`: ``;
    let part3 = resource_area_id !== 0 ? `resource_area_id = ${resource_area_id}`: ``;
    let part4 = resource_meta_id !== 0 ? `resource_meta_id = ${resource_meta_id}`: ``;
    let part5 = resource_format_id !== 0 ? `resource_format_id = ${resource_format_id}`: ``;

    let whereArr = [part1, part2, part3, part4, part5].filter(item=>item.length>0);
    let whereStr = (whereArr.length>0 ? " WHERE ": " ") + whereArr.join(" AND ");
    // console.log(whereArr);
    // console.log(whereStr);


    // 2. 处理SQL语句
    let sql1 = `SELECT COUNT(*) as resource_count FROM t_resource ${whereStr}`;
    let sql2 = `SELECT * FROM t_resource ${whereStr}  LIMIT ${(pageNum - 1) * pageSize}, ${pageSize}`;
    Query(sql1).then((result1)=>{
        Query(sql2).then((result2)=>{
            let data = {};
            data.resource_count = result1.data[0].resource_count;
            data.resource_list = result2.data;
            callBack(ResultTemp(result2.code, '获取成功', data));
        }).catch((error)=>{
            callBack(ResultTemp(error.code, error.msg, error.data));
        })
    });

}

function getResourceDownloadList(res_tag, callBack){
    if(res_tag){
        let sql = `SELECT * FROM t_resource_file WHERE tag=?`;
        Query(sql, [res_tag]).then((result)=>{
            callBack(ResultTemp(result.code, '资源列表获取成功', result.data));
        }).catch((error)=>{
            callBack(ResultTemp(0, '资源列表获取成功', {}));
        })
    }else {
        callBack(ResultTemp(0, '传递参数不完整', {}));
    }
}

function updateResourceViewCount(resource_id, callBack){
   let sql = `UPDATE t_resource SET resource_views = resource_views + 1 WHERE id = ?;`;
   Query(sql, [resource_id]).then((result)=>{
       if(result){
           callBack(ResultTemp(1, '更新成功!', {}));
       }
   }).catch((error)=>{
       callBack(ResultTemp(0, '服务端内部错误', {}));
   })
}


module.exports = {
    getMessage,
    getResourceList,
    getResourceDownloadList,
    updateResourceViewCount
};
