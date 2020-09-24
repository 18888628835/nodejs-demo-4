// node读取文件数据操作
const fs = require('fs') //固定写法操作文件
const data = fs.readFileSync('./mysql.json') //同步读取文件
const mysql = JSON.parse(data) //转化数据共js使用
console.log(mysql);
//node写数据
const newuser = {
    name: "qiuyanxi"
}
mysql.push(newuser)
fs.writeFileSync('./mysql.json', JSON.stringify(mysql));