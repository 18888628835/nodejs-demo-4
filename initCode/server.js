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
    if (path = '/public/registered') {
        if (request.method === 'post') {
            response.statusCode = 200
        }
    } else {
        const x = path === '/' ? 'public/index.html' : path
        let num = x.lastIndexOf('.')
        let suffix = x.slice(num)
        const type = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            '.png': 'image/png',
            '.jpg': 'image/jpeg'
        }
        console.log(type);
        response.setHeader('Content-Type', `${type[suffix]||"text/html"};charset=utf-8`)
        try {
            response.write(fs.readFileSync(`./${x}`))
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