var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号\n例如：node server.js 8888 ')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) {
        queryString = pathWithQuery.substring(pathWithQuery.indexOf('?'))
    }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method
    /******** 从这里开始看，上面不要看 ************/
    console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
    //首页
    if (path === '/index.html') {
        response.statusCode = 200
        response.setHeader('Content-type', 'text/html;charset=UTF-8')
        let cookie = request.headers['cookie'] //找cookie
        let mysql = JSON.parse(fs.readFileSync('./mysql.json')) //读取mysql中的数据
        let session = JSON.parse(fs.readFileSync('./session.json')) //读取session中的数据
        let sessionid
        try {
            sessionid = cookie.split(';').filter(s => s.indexOf("sessionid=") >= 0)[0].split("=")[1] //这里将拿到的cookie给拆开成数组并过滤查看有没有我指定过的cookie
        } catch {} //由于可能存在没有找到的情况，所以这里用了try做错误处理
        if (sessionid) { //如果有这个id，那么就判断是否跟session文件一致
            let user = mysql.find((user) => {
                return user.id === session[sessionid].userid
            })
            let string = ''
            if (user) { //下面是一致的代码
                string = fs.readFileSync('./public/index.html').toString().replace('{{用户名}}', "已登录")
                response.write(string)
            } else {
                response.write(fs.readFileSync('./public/index.html'))
            }
        } else {
            response.write(fs.readFileSync('./public/index.html'))
        }
        response.end()
        //以下为登录
    } else if (path === '/login.html' && request.method === 'POST') {
        response.statusCode = 200
        let arr = []
        request.on('data', (data) => {
            arr.push(data)
        })
        request.on('end', () => {
            const arrdata = JSON.parse(arr) //{userid:xxx,password:xxx}
            response.setHeader('Content-type', 'text/html;charset=UTF-8')
            let sql = JSON.parse(fs.readFileSync('./mysql.json'))
            const n = sql.find((val) => {
                return val.password === arrdata.password && val.userid === arrdata.userid
            }) //判断登录时帐号密码是否一致，如果一致则返回sql中对应的数据
            if (n === undefined) { //不一致给个400返回码
                response.statusCode = 400
            } else {
                response.statusCode = 200
                const session = JSON.parse(fs.readFileSync('./session.json')) //读取新建的session文件
                const random = Math.random() //设置一个随机数
                session[random] = {
                    'userid': n.id
                }
                //把随机数和对应用户的数据放到session文件中
                fs.writeFileSync('./session.json', JSON.stringify(session))
                // 以随机数为cookie码返回给用户，这个cookie就是长串的钥匙
                response.setHeader('Set-Cookie', `sessionid=${random};HttpOnly`)
            }
            response.end()
        })
        //以下为注册
    } else if (path === '/registered.html' && request.method === 'POST') {
        //这里注意不要写成小写
        response.setHeader('Content-type', 'text/html;charset=UTF-8')
        response.statusCode = 200
        const ajaxdata = []
        request.on('data', (data) => {
            ajaxdata.push(data)
        })
        request.on('end', () => {
            const string = Buffer.concat(ajaxdata).toString() //将下载好的数据转成字符串
            console.log(string);
            const jsondata = JSON.parse(string)
            const mysql = JSON.parse(fs.readFileSync('./mysql.json')) //获取json内容并转成数组
            let id = mysql[mysql.length - 1] ? (mysql[mysql.length - 1].id + 1) : 1 //查询数组的最后一位，如果有就取它的id+1，没有就用1
            const newdata = {
                id: id,
                userid: jsondata.userid,
                password: jsondata.password
            }
            mysql.push(newdata)
            fs.writeFileSync('./mysql.json', JSON.stringify(mysql))
        })
        response.end()
    } else {
        const x = path === '/' ? 'index.html' : path
        let num = x.lastIndexOf('.')
        let suffix = x.slice(num)
        const type = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            '.png': 'image/png',
            '.jpg': 'image/jpeg'
        }
        response.setHeader('Content-Type', `${type[suffix]||"text/html"};charset=utf-8`)
        try {
            response.write(fs.readFileSync(`./public/${x}`))
            response.statusCode = 200
        } catch {
            response.write('文件不存在')
            response.statusCode = 404
        }
        response.end()
    }

    /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用电饭煲打开 http://localhost:' + port)