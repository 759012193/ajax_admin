// 使用磁盘引擎: 1) 动态确定存的地方  2) 确保文件名称独一无二
const multer = require('multer');
const path = require('path');

function createUp(direct_path) {
    let storage = multer.diskStorage({
        // 用于设置存储文件的目录
        destination: function (req, file, cb) {
            cb(null, direct_path)
        },
        // 设置存储文件的名称(独一无二)
        filename: function (req, file, cb) {
            // 1. 获取上传图片的后缀名
            let fieldNameArr = file.originalname.split('.');
            let ext = fieldNameArr[fieldNameArr.length-1];
            cb(null, file.fieldname + '-' + Date.now() + '.' + ext);
        }
    });
    return  multer({ storage: storage });
}

// 存管理员的文件信息
const admin_up = createUp(path.join(__dirname, '../../public/uploads/images/admin'));

module.exports = {
    admin_up
};

