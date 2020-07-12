## 前言

我们接着前面的文章[webpack源码解析二](https://vvbug.blog.csdn.net/article/details/107233952)继续往下探索webpack的配置，demo的github地址：[https://github.com/913453448/webpack-demo.git](https://github.com/913453448/webpack-demo.git)。

## DevServer

webpack的`devServer`配置主要是针对[webpack](https://github.com/webpack)/**[webpack-dev-server](https://github.com/webpack/webpack-dev-server)**跟[webpack](https://github.com/webpack)/**[webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware)**的配置，因为`webpack-dev-server`依赖`webpack-dev-middleware`。

我们首先在我们的因为我们的[demo](https://github.com/913453448/webpack-demo.git)是直接link的webpack的源码，所以我们在自己电脑的源码项目中安装一下[webpack-dev-server](https://github.com/webpack/webpack-dev-server)：

```js
npm install webpack-dev-server --save-dev
```

因为直接link的本地webpack源码，所以我们直接在demo项目中执行webpack-dev-server命令看看啥效果：

```js
➜  webpack-demo git:(master) ✗ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server 
ℹ ｢wds｣: Project is running at http://localhost:8080/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from /Users/ocj1/doc/h5/study/webpack/webpack-demo
ℹ ｢wdm｣: Hash: e6c4cebfa2caf63869c4
Version: webpack 5.0.0-beta.7
Time: 2163ms
Built at: 2020-07-010 14:44:04
                                       Asset      Size
        63fe41824cb8236c0896a71b7df7f461.png  59.3 KiB  [emitted]              [name: (app)]
app.fa1d6c2622381a1a.e6c4cebfa2caf638.app.js   629 KiB  [emitted] [immutable]  [name: app]
Entrypoint app = app.fa1d6c2622381a1a.e6c4cebfa2caf638.app.js (63fe41824cb8236c0896a71b7df7f461.png)
./index.js 208 bytes [built]
(webpack)/node_modules/webpack-dev-server/client?http://localhost:8080 4.29 KiB [built]
./demo-vue.vue 1.19 KiB [built]
../node_modules/vue/dist/vue.runtime.esm.js 222 KiB [built]
./demo-publicpath.js 95 bytes [built]
(webpack)/node_modules/webpack-dev-server/node_modules/strip-ansi/index.js 161 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/socket.js 1.53 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/overlay.js 3.51 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/utils/log.js 964 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/sendMessage.js 402 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/reloadApp.js 1.59 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/utils/createSocketUrl.js 2.91 KiB [built]
(webpack)/node_modules/webpack/hot sync nonrecursive ^\.\/log$ 170 bytes [built]
./demo-vue.vue?vue&type=template&id=47a7e22a&scoped=true& 212 bytes [built]
./demo-vue.vue?vue&type=script&lang=js& 258 bytes [built]
    + 35 hidden modules
ℹ ｢wdm｣: Compiled successfully.


```

可以看到，提示编译成功了，并且开启了一个服务器（//localhost:8080/），我们可以直接利用url访问到打包好的资源文件。

我直接在浏览器打开http://127.0.0.1:8080/webpack-dev-server链接：

![dev-server](/Users/ocj1/doc/h5/study/webpack/webpack-demo/dev-server.png)

可以看到，浏览器页面中直接列出了webpack打包过后的所有文件，前面两个文件我们都看得懂，那后面那个app.fa1xxxx.app是什么文件呢？webpack-dev-server说是“magic html for appxxx.app.js”，👌，先留一个悬念在这里地方，我们后面会详细解析它的源码的，我们修改一下我们的入口文件src/index.js，然后直接保存就会自动编译了，

src/index.js:

```js
__webpack_public_path__ = "/";
import demoVue from "./demo-vue";
import Vue from "vue";
import "demo-publicpath";
const root=document.createElement("div");
root.id="app";
document.body.appendChild(root);
const app=new Vue({
    render:(h)=>h(demoVue)
});
app.$mount(root);
```

然后我们打开http://127.0.0.1:8080/app.6703b9171e005729.0902bf9d359ed6f1.app链接：

![dev-server-app](/Users/ocj1/doc/h5/study/webpack/webpack-demo/dev-server-app.png)

可以看到，直接加载了我们的入口js文件，然后渲染了结果，ok！ 小伙伴不懂也没关系哈，后面会详细讲到，算是提前试试水。

我们就按照[官网](https://webpack.js.org/configuration/dev-server/)的顺序结合代码来分析了（跟官网一样带🔑的配置表示是[webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware)的配置）。

------

### before

`function`

一个自定义的中间间函数，也就是说我们可以在webpac-dev-server中的处理函数之前处理我们的请求。

源码对应位置:

node_modules/webpack-dev-server/lib/Server.js:

```js
...
 setupBeforeFeature() {
  /*
  this.app: express对象
  this: webpack-dev-server
  this.compiler: webpack编译器
  */
  this.options.before(this.app, this, this.compiler);
}
...
```

那这个有什么用呢？

比如我们有一个自己的mock接口，我们就可以放在这个地方去初始化，我们写一个登录接口测试一下，

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: ["./index.js"]
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        // library: "demoSay",
        // libraryExport: "default",
        // libraryTarget: "jsonp",

    },
    experiments: {
        // outputModule: true
    },
    module: {
        noParse: /babel-polyfill/,
        rules: [
            {
                test: /.vue$/,
                use: 'vue-loader',
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            config: {
                                path: path.resolve(__dirname, "./postcss.config.js")
                            }
                        }
                    },
                    "sass-loader"
                ],
            },
            {
                test: /\.png$/,
                oneOf: [
                    {
                        resourceQuery: /inline/,
                        loader: "url-loader",
                        options: {
                            limit: 1024 * 1024 * 10
                        }
                    },
                    {
                        resourceQuery: /external/,
                        loader: "file-loader",
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            DemoVue: path.resolve(__dirname, "./src/demo-vue.vue")
        },
        extensions: ['.wasm', '.mjs', '.js', '.json', '.vue'],
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        unsafeCache: /demo-publicpath/,
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ],
    devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res)=>{
                res.json({msg: "login succeed!"});
            });
        }
    }
};
```

然后重新运行webpack-dev-server：

```
➜  webpack-demo git:(master) ✗ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server
```

然后在浏览器打开http://127.0.0.1:8080/login：

```json
{
"msg": "login succeed!"
}
```

我就不截图了，浏览器是会显示我们的json文本的。

### after

`function (app, server, compiler)`

这个跟before含义相反，也就是说我们可以在webpac-dev-server中的处理函数之后处理我们的请求。

比如以下配置：

```js
  devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        }
    }
```

我们在before的时候在请求name参数前面拼接了一个“hello”字符串，然后直接调用next()把请求往后面传递了，在after中输出了json字符串，msg内容为参数name，

我们编译后在浏览器运行get请求http://127.0.0.1:8080/login?name=yasin：

```json
{
"msg": "hello yasin"
}
```

页面会显示json字符串。

ok！ after跟before都说完了，我这里只是列举了两个基本的用法而已，小伙伴可以结合项目做功能扩展，千万不要被demo跟文档限定死了说只能干某一件事情，一定要灵活使用。

### clientLogLevel

`string = 'info': 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none' | 'warning'`

当使用*内联模式(inline mode)*时，在开发工具(DevTools)的控制台(console)将显示消息，如：在重新加载之前，在一个错误之前，或者模块热替换(Hot Module Replacement)启用时。这可能显得很繁琐。

你可以阻止所有这些消息显示，使用这个选项：

```js
clientLogLevel: "none"
```

Usage via the CLI

```bash
webpack-dev-server --client-log-level none
```

比如我们开启hot热加载，然后当我们在浏览器打开页面跟webpack-dev-server建立连接的时候会在dev-tool中显示：

```dash
[WDS] Hot Module Replacement enabled.
client:53 [WDS] Live Reloading enabled.
reloadApp.js:19 [WDS] App hot update...
```

然后断开的时候又会提示：

```dash
client:173 [WDS] Disconnected!
```

所以如果我们觉得不需要提示这些的时候我们可以关闭它，

```d
clientLogLevel: "none"
```

或者

```js
clientLogLevel: "silent"
```

也可以设置log的层级。

### allowedHosts

`[string]`

配置当前服务器的白名单

比如只有localhost跟127.0.0.1或者你自己ip的用户才让访问当前服务器，

**webpack.config.js**

```javascript
module.exports = {
  //...
  devServer: {
    allowedHosts: [
      '127.0.0.1',
      'localhost',
      'xxx.com.cn'
    ]
  }
};
```

哈哈，上面说的有点问题，我们看一下源码，

node_modules/webpack-dev-server/lib/Server.js:

```js
...
const isValidHostname =
      ip.isV4Format(hostname) ||
      ip.isV6Format(hostname) ||
      hostname === 'localhost' ||
      hostname === this.hostname;

    if (isValidHostname) {
      return true;
    }
...
```

也就是说，当发起域名等于“localhost”或者请求是由自己发起的就直接认为是有效果，不会拦截，所以我们上面配置了“127.0.0.1”跟“localhost”没啥用。

### disableHostCheck

`boolean=false`

这个就是上面allowedHosts配置的开关，为true就不会去校验白名单了。

### color- CLI only

`boolean`

Enables/Disables colors on the console.

不在我们配置文件中配置，专门为cli设置的选项，比如我们执行cli的时候可以：

```dash
webpack-dev-server --color
```

是否在终端的console中显示颜色，没有什么研究价值，就不演示了。

### compress

用过express的童鞋应该是知道这个属性的，就是对服务器的文件还有处理的结果做压缩的,感兴趣的可以去看expres的文档。

源码对应位置：

node_modules/webpack-dev-server/lib/Server.js

```js
const compress = require('compression');
...
 setupCompressFeature() {
  	//this.app: express
    this.app.use(compress());
  }
...
```

### contentBase

`string`默认为`process.cwd();`

这个也是属于[express的static目录功能](http://expressjs.com/en/starter/installing.html)，我们可以指定某个目录为静态目录，这样就可以直接访问目录底下所有的文件了。

比如我们设置为lib目录为我们的静态目录,然后提供一个assets的路径供客户端访问，

webpack.config.js：

```js
devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"), //设置一个静态目录的路径
        contentBasePublicPath: "/assets" //设置一个访问的path
    }
```

运行webpack重新编译后就可以直接在浏览器中访问lib目录的内容了，比如访问lib下面的一张图片：

http://127.0.0.1:8080/assets/63fe41824cb8236c0896a71b7df7f461.png

### contentBasePublicPath

表示静态公共目录的访问path。

跟上面的contentBase一起传给express的use函数，以下是express的官方的api描述：

> # 利用 Express 托管静态文件
>
> 为了提供诸如图像、CSS 文件和 JavaScript 文件之类的静态文件，请使用 Express 中的 `express.static` 内置中间件函数。
>
> 此函数特征如下：
>
> ```javascript
> express.static(root, [options])
> ```
>
> The `root` argument specifies the root directory from which to serve static assets. For more information on the `options` argument, see [express.static](https://www.expressjs.com.cn/4x/api.html#express.static).
>
> 例如，通过如下代码就可以将 `public` 目录下的图片、CSS 文件、JavaScript 文件对外开放访问了：
>
> ```javascript
> app.use(express.static('public'))
> ```
>
> 现在，你就可以访问 `public` 目录中的所有文件了：
>
> ```plain-text
> http://localhost:3000/images/kitten.jpg
> http://localhost:3000/css/style.css
> http://localhost:3000/js/app.js
> http://localhost:3000/images/bg.png
> http://localhost:3000/hello.html
> ```
>
> Express 在静态目录查找文件，因此，存放静态文件的目录名不会出现在 URL 中。
>
> 如果要使用多个静态资源目录，请多次调用 `express.static` 中间件函数：
>
> ```javascript
> app.use(express.static('public'))
> app.use(express.static('files'))
> ```
>
> 访问静态资源文件时，`express.static` 中间件函数会根据目录的添加顺序查找所需的文件。
>
> 注意：For best results, [use a reverse proxy](https://www.expressjs.com.cn/en/advanced/best-practice-performance.html#use-a-reverse-proxy) cache to improve performance of serving static assets.
>
> To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served by the `express.static` function, [specify a mount path](https://www.expressjs.com.cn/4x/api.html#app.use) for the static directory, as shown below:
>
> ```javascript
> app.use('/static', express.static('public'))
> ```
>
> 现在，你就可以通过带有 `/static` 前缀地址来访问 `public` 目录中的文件了。
>
> ```plain-text
> http://localhost:3000/static/images/kitten.jpg
> http://localhost:3000/static/css/style.css
> http://localhost:3000/static/js/app.js
> http://localhost:3000/static/images/bg.png
> http://localhost:3000/static/hello.html
> ```
>
> 然而，the path that you provide to the `express.static` function is relative to the directory from where you launch your `node` process. If you run the express app from another directory, it’s safer to use the absolute path of the directory that you want to serve:
>
> ```javascript
> app.use('/static', express.static(path.join(__dirname, 'public')))
> ```

### lazy- CLI only🔑

是否开启webpack的lazy（懒编译）模式，默认是false，只能在cli中使用，当启用 `lazy` 时，dev-server 只有在请求时才编译包(bundle)。这意味着 webpack 不会监视任何文件改动。我们称之为“**惰性模式**”。

```js
lazy: true
```

Usage via the CLI

```bash
webpack-dev-server --lazy
```

> `watchOptions` 在使用**惰性模式**时无效。

比如我们在没开启lazy模式的时候会看到终端中输出的信息：

```js
➜  webpack-demo git:(master) ✗ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server              
ℹ ｢wds｣: Project is running at http://localhost:8081/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from xxx/webpack/webpack-demo/lib
ℹ ｢wdm｣: Hash: dcaae6f694328d4ff195
Version: webpack 5.0.0-beta.7
Time: 1948ms
Built at: 2020-07-010 17:00:31
                                       Asset      Size
        63fe41824cb8236c0896a71b7df7f461.png  59.3 KiB  [emitted]              [name: (app)]
app.98a2a95d383bca25.dcaae6f694328d4f.app.js   629 KiB  [emitted] [immutable]  [name: app]
Entrypoint app = app.98a2a95d383bca25.dcaae6f694328d4f.app.js (63fe41824cb8236c0896a71b7df7f461.png)
./index.js 272 bytes [built]
(webpack)/node_modules/webpack-dev-server/client?http://localhost:8081 4.29 KiB [built]
./demo-vue.vue 1.19 KiB [built]
../node_modules/vue/dist/vue.runtime.esm.js 222 KiB [built]
./demo-publicpath.js 95 bytes [built]
(webpack)/node_modules/webpack-dev-server/node_modules/strip-ansi/index.js 161 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/socket.js 1.53 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/overlay.js 3.51 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/utils/log.js 964 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/sendMessage.js 402 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/reloadApp.js 1.59 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/utils/createSocketUrl.js 2.91 KiB [built]
(webpack)/node_modules/webpack/hot sync nonrecursive ^\.\/log$ 170 bytes [built]
./demo-vue.vue?vue&type=template&id=47a7e22a&scoped=true& 212 bytes [built]
./demo-vue.vue?vue&type=script&lang=js& 258 bytes [built]
    + 35 hidden modules
ℹ ｢wdm｣: Compiled successfully.

```

当我们开启了lazy后我们看输出的信息：

```dash
➜  webpack-demo git:(master) ✗ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server --lazy
ℹ ｢wds｣: Project is running at http://localhost:8081/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from xxwebpack/webpack-demo/lib

```

可以看到，webpack的编译信息没了。

当我们访问某个文件的时候,比如：http://127.0.0.1:8080/assets/app.eaca56e43bb13d8f.5839dd9fae5920f1.app.js的时候，会发现浏览器报错：

```js
http://127.0.0.1:8080/app.6703b9171e005729.0902bf9d359ed6f1.app.js
```

那是因为我们没有配置filename属性，所以webpack-dev-middlewar条件判断后认为是不需要编译的，所以我们访问不到，

node_modules/webpack-dev-middleware/lib/util.js：

```js
...
 handleRequest(context, filename, processRequest, req) {
    // in lazy mode, rebuild on bundle request
    if (
      context.options.lazy &&
      (!context.options.filename || context.options.filename.test(filename))
    ) {
      context.rebuild();
    }
...
```

因为filename默认是output.filename,而我们配置文件中这个值为"[name].[contenthash:16].[fullhash:16].[id].js"：

```js
 output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        // library: "demoSay",
        // libraryExport: "default",
        // libraryTarget: "jsonp",

    },
```

所以判断条件是不成立的：

```js
if (
      context.options.lazy &&
      (!context.options.filename || context.options.filename.test(filename))
    ) {
      context.rebuild();
    }
```

所以就不会走webpack的rebuild方法，因此我们是访问不到该文件的，知道原因后我们直接操作一下filename属性。

### filename🔑

`string=poutput.filename`

这是给webpack-dev-middleware用的参数，并且与lazy参数一起使用的。

我们修改一下我们的配置文件，给它的devServer上加一个filename属性：

```js
devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"),
        contentBasePublicPath: "/assets",
        filename: /app\.js/
    }
```

可以看到，我们直接用了一个正则，也就是当访问"app.js"的文件的时候会让webpack重新编译。

我们重新运行webpack：

```js
➜  webpack-demo git:(master) ✗ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server --lazy
ℹ ｢wds｣: Project is running at http://localhost:8080/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from xxx/webpack-demo/lib

```

然后直接浏览器中访问“http://127.0.0.1:8080/app.6703b9171e005729.0902bf9d359ed6f1.app.js”，打开后会发现浏览器卡顿了一下，然后看到了我们终端打印了log信息：

```js
ℹ ｢wdm｣: wait until bundle finished: /app.6703b9171e005729.0902bf9d359ed6f1.app.js
ℹ ｢wdm｣: Hash: 0902bf9d359ed6f10858
Version: webpack 5.0.0-beta.7
Time: 2079ms
Built at: 2020-07-010 17:21:02
                                       Asset      Size
        63fe41824cb8236c0896a71b7df7f461.png  59.3 KiB  [emitted]              [name: (app)]
app.6703b9171e005729.0902bf9d359ed6f1.app.js   629 KiB  [emitted] [immutable]  [name: app]
Entrypoint app = app.6703b9171e005729.0902bf9d359ed6f1.app.js (63fe41824cb8236c0896a71b7df7f461.png)
./index.js 272 bytes [built]
(webpack)/node_modules/webpack-dev-server/client?http://localhost:8080 4.29 KiB [built]
./demo-vue.vue 1.19 KiB [built]
../node_modules/vue/dist/vue.runtime.esm.js 222 KiB [built]
./demo-publicpath.js 95 bytes [built]
(webpack)/node_modules/webpack-dev-server/node_modules/strip-ansi/index.js 161 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/socket.js 1.53 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/overlay.js 3.51 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/utils/log.js 964 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/sendMessage.js 402 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/reloadApp.js 1.59 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/utils/createSocketUrl.js 2.91 KiB [built]
(webpack)/node_modules/webpack/hot sync nonrecursive ^\.\/log$ 170 bytes [built]
./demo-vue.vue?vue&type=template&id=47a7e22a&scoped=true& 212 bytes [built]
./demo-vue.vue?vue&type=script&lang=js& 258 bytes [built]
    + 35 hidden modules
ℹ ｢wdm｣: Compiled successfully.

```

最后显示“ℹ ｢wdm｣: Compiled successfully”信息的时候我们页面也就显示内容了。

*ok！ devServer的filename跟lazy都讲完了，要注意，默认webpack-dev-server不是懒加载模式的，所以当设置懒加载的时候，之后要讲的watch选项也都会失效了。*

### headers🔑

`object`

给所有的返回结果header上加参数。

比如：

**webpack.config.js**

```js
devServer: {
    before(app, server, compiler) {
        app.get("/login",(req,res,next)=>{
            req.query.name="hello "+req.query.name;
            next();
        });
    },
    after(app, server, compiler) {
        app.get("/login",(req,res,next)=>{
            res.json({msg: req.query.name});
        });
    },
    clientLogLevel: "info",
    allowedHosts: [
        "localhost"
    ],
    contentBase: path.join(process.cwd(), "lib"),
    contentBasePublicPath: "/assets",
    filename: /app\.js/,
    headers: {
        'X-Custom-Foo': 'bar'
    }
}
```

然后我们重新运行webpack，继续访问一个文件http://127.0.0.1:8080/assets/app.eaca56e43bb13d8f.5839dd9fae5920f1.app.js，我们打开浏览器看一下返回文件的header：

```dart
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Connection: keep-alive
Content-Length: 275043
Content-Type: application/javascript; charset=UTF-8
Date: Fri, 10 Jul 2020 09:31:18 GMT
ETag: W/"43263-17337dfa05e"
Last-Modified: Fri, 10 Jul 2020 08:37:49 GMT
X-Custom-Foo: bar
X-Powered-By: Express
```

打开浏览器我们可以看到我们在返回头部设置的参数“bar”。

### historyApiFallback

当我们访问不存在的目录或者文件的时候，浏览器就会报404的错误，如果我们服务器不想要在客户端显示404页面的话，我们可以配置一个默认的页面给客户端，比如我们在demo项目的lib目录下创建一个index.html文件，

lib/index.html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
	"我是404页面"
</body>
</html>
```

然后我们修改一下配置文件，把historyApiFallback设置成true，

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: ["./index.js"]
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        // library: "demoSay",
        // libraryExport: "default",
        // libraryTarget: "jsonp",

    },
    experiments: {
        // outputModule: true
    },
    module: {
        noParse: /babel-polyfill/,
        rules: [
            {
                test: /.vue$/,
                use: 'vue-loader',
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            config: {
                                path: path.resolve(__dirname, "./postcss.config.js")
                            }
                        }
                    },
                    "sass-loader"
                ],
            },
            {
                test: /\.png$/,
                oneOf: [
                    {
                        resourceQuery: /inline/,
                        loader: "url-loader",
                        options: {
                            limit: 1024 * 1024 * 10
                        }
                    },
                    {
                        resourceQuery: /external/,
                        loader: "file-loader",
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            DemoVue: path.resolve(__dirname, "./src/demo-vue.vue")
        },
        extensions: ['.wasm', '.mjs', '.js', '.json', '.vue'],
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        unsafeCache: /demo-publicpath/,
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ],
    devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"),
        // contentBasePublicPath: "/assets",
        filename: /app\.js/,
        headers: {
            'X-Custom-Foo': 'bar'
        },
        historyApiFallback: true
    }
};
```

我们去掉了之前的“contentBasePublicPath”选项，因为我们需要直接在服务器的根目录访问index.html文件。

我们直接运行webpack，然后访问一个不存在的链接地址：http://127.0.0.1:8080/121212121212，

运行后是可以在页面中看到"我是404页面"提示的，我就不截屏啦，小伙伴自己跑跑哦！

源码地址：

node_modules/webpack-dev-server/lib/Server.js

```js
const historyApiFallback = require('connect-history-api-fallback');
...
 setupHistoryApiFallbackFeature() {
    const fallback =
      typeof this.options.historyApiFallback === 'object'
        ? this.options.historyApiFallback
        : null;

    // Fall back to /index.html if nothing else matches.
    this.app.use(historyApiFallback(fallback));
  }
...
```

### host

指定使用一个 host。默认是 `localhost`。

没什么好分析的，因为webpack-dev-server也是直接给到了http,

node_modules/webpack-dev-server/lib/Server.js:

```js
...
listen(port, hostname, fn) {
    this.hostname = hostname;

    return this.listeningApp.listen(port, hostname, (err) => {
...
```

如果你希望服务器外部可访问，指定如下：

```js
host: "0.0.0.0"
```

Usage via the CLI

```bash
webpack-dev-server --host 0.0.0.0
```

### port

`number 默认： 8080`

指定服务器的端口。

我们demo中用一下host跟port参数，

webpack.config.js:

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: ["./index.js"]
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        // library: "demoSay",
        // libraryExport: "default",
        // libraryTarget: "jsonp",

    },
    experiments: {
        // outputModule: true
    },
    module: {
        noParse: /babel-polyfill/,
        rules: [
            {
                test: /.vue$/,
                use: 'vue-loader',
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            config: {
                                path: path.resolve(__dirname, "./postcss.config.js")
                            }
                        }
                    },
                    "sass-loader"
                ],
            },
            {
                test: /\.png$/,
                oneOf: [
                    {
                        resourceQuery: /inline/,
                        loader: "url-loader",
                        options: {
                            limit: 1024 * 1024 * 10
                        }
                    },
                    {
                        resourceQuery: /external/,
                        loader: "file-loader",
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            DemoVue: path.resolve(__dirname, "./src/demo-vue.vue")
        },
        extensions: ['.wasm', '.mjs', '.js', '.json', '.vue'],
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        unsafeCache: /demo-publicpath/,
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ],
    devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"),
        // contentBasePublicPath: "/assets",
        filename: /app\.js/,
        headers: {
            'X-Custom-Foo': 'bar'
        },
        historyApiFallback: true,
        host: "0.0.0.0",
        port: "8090"
    }
};
```

我们指定了host为“0.0.0.0”，端口指定了“8090”，我们运行webpack-dev-server：

```js
^C192:webpack-demo yinqingyang$ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server 
watch undefined
callback undefined
ℹ ｢wds｣: Project is running at http://0.0.0.0:8090/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not xxx
ℹ ｢wds｣: 404s will fallback to /index.html
ℹ ｢wdm｣: Hash: 1cd70981ab252d761840
Version: webpack 5.0.0-beta.7

```

可以看到一些提示信息，说我们的项目已经在“http://0.0.0.0:8090/”上运行了。

我们可以利用当前ip在局域网访问我们的服务器了，比如访问我们的电脑：http://192.168.2.103:8090/webpack-dev-server

### hot

`boolean=false`

启用 webpack 的模块[Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) (热替换)特性：

**webpack.config.js**

```javascript
module.exports = {
  //...
  devServer: {
    hot: true
  }
};
```

*Note that* [`webpack.HotModuleReplacementPlugin`](https://webpack.js.org/plugins/hot-module-replacement-plugin/) *is required to fully enable HMR. If* `webpack` *or* `webpack-dev-server` *are launched with the* `--hot` *option, this plugin will be added automatically, so you may not need to add this to your* `webpack.config.js`*. See the* [HMR concepts page](https://webpack.js.org/concepts/hot-module-replacement/) *for more information.*

如果`webpack-dev-server`设置了hot属性的话，就会自动的给webpack添加[`webpack.HotModuleReplacementPlugin`](https://webpack.js.org/plugins/hot-module-replacement-plugin/)插件。

什么意思呢？ 我们在demo的webpack配置中打开hot属性：

webpack.config.js

```js
 devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"),
        // contentBasePublicPath: "/assets",
        filename: /app\.js/,
        headers: {
            'X-Custom-Foo': 'bar'
        },
        historyApiFallback: true,
        host: "0.0.0.0",
        port: "8090",
        hot: true
    }
```

然后我们运行webpack：

```
 node ./node_modules/webpack/node_modules/.bin/webpack-dev-server
```

然后打开http://127.0.0.1:8090/webpack-dev-server页面找到我们的app入口：

```js
63fe41824cb8236c0896a71b7df7f461.png
app.f3eee8fa7df557cf.27c85f7ee5cd42b3.app.js
app.f3eee8fa7df557cf.27c85f7ee5cd42b3.app (magic html for app.f3eee8fa7df557cf.27c85f7ee5cd42b3.app.js) (webpack-dev-server)
```

我们直接点开app入口“app.f3eee8fa7df557cf.27c85f7ee5cd42b3.app”，当你打开页面的时候会显示页面内容，当修改了某一个值的时候webpack会自动编译，然后自动刷新页面，效果我就不演示了。

源码位置：

node_modules/webpack-dev-server/lib/utils/addEntries.js

```js
...
 if (options.hot || options.hotOnly) {
        config.plugins = config.plugins || [];
        if (
          !config.plugins.find(
            // Check for the name rather than the constructor reference in case
            // there are multiple copies of webpack installed
            (plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin'
          )
        ) {
          config.plugins.push(new webpack.HotModuleReplacementPlugin());
        }
      }
...
```

可以看到，会自动的添加HotModuleReplacementPlugin插件。

### hotOnly

跟上面的hot功能基本一致，但是当webpack编译失败或者遇到其它问题的时候，需要强制reload当前页面才能看到效果的时候，hotOnly是不会刷新页面的。

源码位置：

node_modules/webpack-dev-server/lib/utils/addEntries.js:

```js
...
  if (options.hotOnly) {
      hotEntry = require.resolve('webpack/hot/only-dev-server');
    } else if (options.hot) {
      hotEntry = require.resolve('webpack/hot/dev-server');
    }
...
```

webpack/hot/dev-server.js

```js
...
if (module.hot) {
...
	var check = function check() {
		module.hot
			.check(true)
			.then(function(updatedModules) {
				...
					window.location.reload();
					return;
				}
```

webpack/hot/only-dev-server.js:

```js
var check = function check() {
		module.hot
			.check()
			.then(function(updatedModules) {
				if (!updatedModules) {
					log("warning", "[HMR] Cannot find update. Need to do a full reload!");
					log(
						"warning",
						"[HMR] (Probably because of restarting the webpack-dev-server)"
					);
					return;
				}
```

可以看到，dev-server是会去reload页面的，而only-dev-server是不会去reload页面的。

### https

`boolean` `object`

默认情况下，dev-server 通过 HTTP 提供服务。也可以选择带有 HTTPS 的 HTTP/2 提供服务：

```js
https: true
```

以上设置使用了自签名证书，但是你可以提供自己的：

```js
https: {
  key: fs.readFileSync("/path/to/server.key"),
  cert: fs.readFileSync("/path/to/server.crt"),
  ca: fs.readFileSync("/path/to/ca.pem"),
}
```

此对象直接传递到 Node.js HTTPS 模块，所以更多信息请查看 [HTTPS 文档](https://nodejs.org/api/https.html)。

Usage via the CLI

```bash
webpack-dev-server --https
```

To pass your own certificate via the CLI use the following options

```bash
webpack-dev-server --https --key /path/to/server.key --cert /path/to/server.crt --cacert /path/to/ca.
```

### index

`string="index.html"`

The filename that is considered the index file.

```javascript
index: 'index.htm'
```

### Info - CLI only

```
boolean
```

终端显示的信息. 默认开启，如果需要关闭：

```bash
webpack-dev-server --info=false
```

这样终端输出栏中就不会有编译信息了：

```bash
^C192:webpack-demo yinqingyang$ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server --info=false
```

### injectClient

webpack-dev-server默认会为特定的target添加webpack的entry文件“client”，client入口负责跟webpack-dev-server保持socket通信（编译成功、log信息、热载、overlay等等），比如hot功能，其实就是利用[HotModuleReplacementPlugin`](https://webpack.js.org/plugins/hot-module-replacement-plugin/)插件动态往js文件中注入hot模块跟client通信。

client入口源码：

node_modules/webpack-dev-server/client/index.js

```js
'use strict';
/* global __resourceQuery WorkerGlobalScope self */

/* eslint prefer-destructuring: off */

var stripAnsi = require('strip-ansi');

var socket = require('./socket');

var overlay = require('./overlay');

var _require = require('./utils/log'),
    log = _require.log,
    setLogLevel = _require.setLogLevel;

var sendMessage = require('./utils/sendMessage');

var reloadApp = require('./utils/reloadApp');

var createSocketUrl = require('./utils/createSocketUrl');

var status = {
  isUnloading: false,
  currentHash: ''
};
var options = {
  hot: false,
  hotReload: true,
  liveReload: false,
  initial: true,
  useWarningOverlay: false,
  useErrorOverlay: false,
  useProgress: false
};
var socketUrl = createSocketUrl(__resourceQuery);
self.addEventListener('beforeunload', function () {
  status.isUnloading = true;
});

if (typeof window !== 'undefined') {
  var qs = window.location.search.toLowerCase();
  options.hotReload = qs.indexOf('hotreload=false') === -1;
}

var onSocketMessage = {
  hot: function hot() {
    options.hot = true;
    log.info('[WDS] Hot Module Replacement enabled.');
  },
  liveReload: function liveReload() {
    options.liveReload = true;
    log.info('[WDS] Live Reloading enabled.');
  },
  invalid: function invalid() {
    log.info('[WDS] App updated. Recompiling...'); // fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.

    if (options.useWarningOverlay || options.useErrorOverlay) {
      overlay.clear();
    }

    sendMessage('Invalid');
  },
  hash: function hash(_hash) {
    status.currentHash = _hash;
  },
  'still-ok': function stillOk() {
    log.info('[WDS] Nothing changed.');

    if (options.useWarningOverlay || options.useErrorOverlay) {
      overlay.clear();
    }

    sendMessage('StillOk');
  },
  'log-level': function logLevel(level) {
    var hotCtx = require.context('webpack/hot', false, /^\.\/log$/);

    if (hotCtx.keys().indexOf('./log') !== -1) {
      hotCtx('./log').setLogLevel(level);
    }

    setLogLevel(level);
  },
  overlay: function overlay(value) {
    if (typeof document !== 'undefined') {
      if (typeof value === 'boolean') {
        options.useWarningOverlay = false;
        options.useErrorOverlay = value;
      } else if (value) {
        options.useWarningOverlay = value.warnings;
        options.useErrorOverlay = value.errors;
      }
    }
  },
  progress: function progress(_progress) {
    if (typeof document !== 'undefined') {
      options.useProgress = _progress;
    }
  },
  'progress-update': function progressUpdate(data) {
    if (options.useProgress) {
      log.info("[WDS] ".concat(data.percent, "% - ").concat(data.msg, "."));
    }

    sendMessage('Progress', data);
  },
  ok: function ok() {
    sendMessage('Ok');

    if (options.useWarningOverlay || options.useErrorOverlay) {
      overlay.clear();
    }

    if (options.initial) {
      return options.initial = false;
    } // eslint-disable-line no-return-assign


    reloadApp(options, status);
  },
  'content-changed': function contentChanged() {
    log.info('[WDS] Content base changed. Reloading...');
    self.location.reload();
  },
  warnings: function warnings(_warnings) {
    log.warn('[WDS] Warnings while compiling.');

    var strippedWarnings = _warnings.map(function (warning) {
      return stripAnsi(warning);
    });

    sendMessage('Warnings', strippedWarnings);

    for (var i = 0; i < strippedWarnings.length; i++) {
      log.warn(strippedWarnings[i]);
    }

    if (options.useWarningOverlay) {
      overlay.showMessage(_warnings);
    }

    if (options.initial) {
      return options.initial = false;
    } // eslint-disable-line no-return-assign


    reloadApp(options, status);
  },
  errors: function errors(_errors) {
    log.error('[WDS] Errors while compiling. Reload prevented.');

    var strippedErrors = _errors.map(function (error) {
      return stripAnsi(error);
    });

    sendMessage('Errors', strippedErrors);

    for (var i = 0; i < strippedErrors.length; i++) {
      log.error(strippedErrors[i]);
    }

    if (options.useErrorOverlay) {
      overlay.showMessage(_errors);
    }

    options.initial = false;
  },
  error: function error(_error) {
    log.error(_error);
  },
  close: function close() {
    log.error('[WDS] Disconnected!');
    sendMessage('Close');
  }
};
socket(socketUrl, onSocketMessage);
```

client具体源码内容就不在这里分析了，不过后面可能会单独写一篇文章来解析webpack的热载功能。

ok～也就是说如果关闭了injectClient选项的话，hot跟hotOnly、overlay等功能都会失效。

### injectHot

跟上面的injectClient差不多，算控制injectClient的一个hot子项，比如我们需要根据配置文件来看是不是需要关闭热载功能：

```js
module.exports = {
  //...
  devServer: {
    hot: true,
    injectHot: (compilerConfig) => compilerConfig.name === 'only-include'
  }
};
```

### inline

就是控制上面说的hot、injectClient、injectHot等client端的一些配置，看源码估计一目了然了：

node_modules/webpack-dev-server/lib/utils/addEntries.js

```js
function addEntries(config, options, server) {
  if (options.inline !== false) {
    // we're stubbing the app in this method as it's static and doesn't require
    // a server to be supplied. createDomain requires an app with the
    // address() signature.

    const app = server || {
      address() {
        return { port: options.port };
      },
    };
       let hotEntry;

    if (options.hotOnly) {
      hotEntry = require.resolve('webpack/hot/only-dev-server');
    } else if (options.hot) {
      hotEntry = require.resolve('webpack/hot/dev-server');
    }
    ...
```

有什么用呢？比如我们需要自己实现一个热载功能，就可以使用inline=false关闭所有client相关的代码，避免我们的代码受到侵入。

### open

`boolean = false` `string` `object`

是否在服务器开启之后打开某个页面，传递的参数最后会给到opn第三方库,

node_modules/opn/readme.md:

~~~markdown
# opn

> A better [node-open](https://github.com/pwnall/node-open). Opens stuff like websites, files, executables. Cross-platform.

If need this for Electron, use [`shell.openItem()`](https://electronjs.org/docs/api/shell#shellopenitemfullpath) instead.


#### Why?

- Actively maintained
- Supports app arguments
- Safer as it uses `spawn` instead of `exec`
- Fixes most of the open `node-open` issues
- Includes the latest [`xdg-open` script](http://cgit.freedesktop.org/xdg/xdg-utils/commit/?id=c55122295c2a480fa721a9614f0e2d42b2949c18) for Linux


## Install

```
$ npm install opn
```


## Usage

```js
const opn = require('opn');

// Opens the image in the default image viewer
opn('unicorn.png').then(() => {
	// image viewer closed
});

// Opens the url in the default browser
opn('http://sindresorhus.com');

// Specify the app to open in
opn('http://sindresorhus.com', {app: 'firefox'});

// Specify app arguments
opn('http://sindresorhus.com', {app: ['google chrome', '--incognito']});
```


## API

Uses the command `open` on macOS, `start` on Windows and `xdg-open` on other platforms.

### opn(target, [options])

Returns a promise for the [spawned child process](https://nodejs.org/api/child_process.html#child_process_class_childprocess). You would normally not need to use this for anything, but it can be useful if you'd like to attach custom event listeners or perform other operations directly on the spawned process.

#### target

Type: `string`

The thing you want to open. Can be a URL, file, or executable.

Opens in the default app for the file type. For example, URLs opens in your default browser.

#### options

Type: `Object`

##### wait

Type: `boolean`<br>
Default: `true`

Wait for the opened app to exit before fulfilling the promise. If `false` it's fulfilled immediately when opening the app.

On Windows you have to explicitly specify an app for it to be able to wait.

##### app

Type: `string` `Array`

Specify the app to open the `target` with, or an array with the app and app arguments.

The app name is platform dependent. Don't hard code it in reusable modules. For example, Chrome is `google chrome` on macOS, `google-chrome` on Linux and `chrome` on Windows.


## Related

- [opn-cli](https://github.com/sindresorhus/opn-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)

~~~

👌，那么对应webpack-dev-server中的源码是啥呢？

node_modules/webpack-dev-server/lib/Server.js：

```js
...
 showStatus() {
    const suffix =
      this.options.inline !== false || this.options.lazy === true
        ? '/'
        : '/webpack-dev-server/';
    const uri = `${createDomain(this.options, this.listeningApp)}${suffix}`;

    status(
      uri,
      this.options,
      this.log,
      this.options.stats && this.options.stats.colors
    );
  }
...
```

ok，可以看到webpack-dev-server在我们demo中如果open=true的话是默认打开“http://0.0.0.0:8090”。

webpack.config.js：

```js
devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"),
        // contentBasePublicPath: "/assets",
        filename: /app\.js/,
        headers: {
            'X-Custom-Foo': 'bar'
        },
        historyApiFallback: true,
        host: "0.0.0.0",
        port: "8090",
        hot: true,
        liveReload: false,
        open: true,
    }
```

小伙伴可以自己运行一下哦！

我们继续往下看一下：

```js
 status(
      uri,
      this.options,
      this.log,
      this.options.stats && this.options.stats.colors
    );
```

node_modules/webpack-dev-server/lib/utils/status.js:

```js
'use strict';

const logger = require('webpack-log');
const colors = require('./colors');
const runOpen = require('./runOpen');

// TODO: don't emit logs when webpack-dev-server is used via Node.js API
function status(uri, options, log, useColor) {
  ...

  if (options.open) {
    runOpen(uri, options, log);
  }
}

module.exports = status;

```

node_modules/webpack-dev-server/lib/utils/runOpen.js:

```js
'use strict';

const open = require('opn');
const isAbsoluteUrl = require('is-absolute-url');

function runOpen(uri, options, log) {
  // https://github.com/webpack/webpack-dev-server/issues/1990
  let openOptions = { wait: false };
  let openOptionValue = '';

  if (typeof options.open === 'string') {
    openOptions = Object.assign({}, openOptions, { app: options.open });
    openOptionValue = `: "${options.open}"`;
  } else if (typeof options.open === 'object') {
    openOptions = options.open;
    openOptionValue = `: "${JSON.stringify(options.open)}"`;
  }

  const pages =
    typeof options.openPage === 'string'
      ? [options.openPage]
      : options.openPage || [''];

  return Promise.all(
    pages.map((page) => {
      const pageUrl = page && isAbsoluteUrl(page) ? page : `${uri}${page}`;

      return open(pageUrl, openOptions).catch(() => {
        log.warn(
          `Unable to open "${pageUrl}" in browser${openOptionValue}. If you are running in a headless environment, please do not use the --open flag`
        );
      });
    })
  );
}

module.exports = runOpen;

```

Ok! 通过上面源码我们可以知道，open选项为string或者object的时候其实就是给opn第三方库的参数，比如我们需要用火狐浏览器打开我们的页面，我们可以这样设置：

string模式

```js
open: "firefox",
```

对象模式:

```js
open: {
	app: ["firefox"]
}
```

还可以传参数跟在数组后面，更多选项可以去参考opn的api。

### openPage

`string or array`

指定打开的页面，可以是一个页面string，也可以是多个页面array，

比如需要打开：

```js
openPage:[
  "a",//如果配置了相对路径的话就会打开 domain://host:port/a页面
  "http://xxx.com.cn" //如果配置了绝对路径的话就会直接打开
]
```

### overlay

`boolean=`false `object`

是否需要显示client 的遮罩层（用来显示webpack的errors跟warnings），默认是关闭的，如果要打开可以设置true:

```js
overlay: true
```

可以单独设置warnings跟errors是否需要显示：

```js
overlay: {
  warnings: true,
  errors: true
}
```

比如我们修改一下index.js让webpack报错，

src/index.html:

```js
__webpack_public_path__ = "/";
import demoVue from "./demo-vue";
import Vue from "vue";
import "demo-publicpath";
const root=document.createElement("div");
root.id="app";
document.body.appendChild(root
const app=new Vue({
    render:(h)=>h(demoVue)
});
app.$mount(root);
```

然后修改配置文件把overlay打开，

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: ["./index.js"]
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        // library: "demoSay",
        // libraryExport: "default",
        // libraryTarget: "jsonp",

    },
    experiments: {
        // outputModule: true
    },
    module: {
        noParse: /babel-polyfill/,
        rules: [
            {
                test: /.vue$/,
                use: 'vue-loader',
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            config: {
                                path: path.resolve(__dirname, "./postcss.config.js")
                            }
                        }
                    },
                    "sass-loader"
                ],
            },
            {
                test: /\.png$/,
                oneOf: [
                    {
                        resourceQuery: /inline/,
                        loader: "url-loader",
                        options: {
                            limit: 1024 * 1024 * 10
                        }
                    },
                    {
                        resourceQuery: /external/,
                        loader: "file-loader",
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            DemoVue: path.resolve(__dirname, "./src/demo-vue.vue")
        },
        extensions: ['.wasm', '.mjs', '.js', '.json', '.vue'],
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        unsafeCache: /demo-publicpath/,
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ],
    devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"),
        // contentBasePublicPath: "/assets",
        filename: /app\.js/,
        headers: {
            'X-Custom-Foo': 'bar'
        },
        historyApiFallback: true,
        host: "0.0.0.0",
        port: "8090",
        hot: true,
        liveReload: false,
        // open: {
        //     app: ["firefox"]
        // },
        overlay: true
    }
};
```

然后运行webpack看效果：

```bash
...
./index.js 270 bytes [built] [failed] [1 error]
    + 39 hidden modules

ERROR in ./index.js 8:0
Module parse failed: Unexpected token (8:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
| root.id="app";
| document.body.appendChild(root
> const app=new Vue({
|     render:(h)=>h(demoVue)
| });

ℹ ｢wdm｣: Failed to compile.

```

![overlay](/Users/yinqingyang/前端架构系列之(webpack)/webpack-demo/overlay.png)

可以看到，浏览器中显示了终端输出的报错信息：

```bash
ℹ ｢wdm｣: Failed to compile.
```

### proxy

`object`

如果你有单独的后端开发服务器 API，并且希望在同域名下发送 API 请求 ，那么代理某些 URL 会很有用。

dev-server 使用了非常强大的 [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) 包。更多高级用法，请查阅其[文档](https://github.com/chimurai/http-proxy-middleware#options)。

在 `localhost:3000` 上有后端服务的话，你可以这样启用代理：

```js
proxy: {
  "/api": "http://localhost:3000"
}
```

请求到 `/api/users` 现在会被代理到请求 `http://localhost:3000/api/users`。

如果你不想始终传递 `/api` ，则需要重写路径：

```js
proxy: {
  "/api": {
    target: "http://localhost:3000",
    pathRewrite: {"^/api" : ""}
  }
}
```

默认情况下，不接受运行在 HTTPS 上，且使用了无效证书的后端服务器。如果你想要接受，修改配置如下：

```js
proxy: {
  "/api": {
    target: "https://other-server.example.com",
    secure: false
  }
}
```

有时你不想代理所有的请求。可以基于一个函数的返回值绕过代理。

在函数中你可以访问请求体、响应体和代理选项。必须返回 `false` 或路径，来跳过代理请求。

例如：对于浏览器请求，你想要提供一个 HTML 页面，但是对于 API 请求则保持代理。你可以这样做：

```js
proxy: {
  "/api": {
    target: "http://localhost:3000",
    bypass: function(req, res, proxyOptions) {
      if (req.headers.accept.indexOf("html") !== -1) {
        console.log("Skipping proxy for browser request.");
        return "/index.html";
      }
    }
  }
}
```

If you want to proxy multiple, specific paths to the same target, you can use an array of one or more objects with a `context` property:

```js
proxy: [{
  context: ["/auth", "/api"],
  target: "http://localhost:3000",
}]
```

对应源码位置：

node_modules/webpack-dev-server/lib/Server.js

```js
...
const httpProxyMiddleware = require('http-proxy-middleware');
...
 setupProxyFeature() {
    /**
     * Assume a proxy configuration specified as:
     * proxy: {
     *   'context': { options }
     * }
     * OR
     * proxy: {
     *   'context': 'target'
     * }
     */
    if (!Array.isArray(this.options.proxy)) {
      if (Object.prototype.hasOwnProperty.call(this.options.proxy, 'target')) {
        this.options.proxy = [this.options.proxy];
      } else {
        this.options.proxy = Object.keys(this.options.proxy).map((context) => {
          let proxyOptions;
          // For backwards compatibility reasons.
          const correctedContext = context
            .replace(/^\*$/, '**')
            .replace(/\/\*$/, '');

          if (typeof this.options.proxy[context] === 'string') {
            proxyOptions = {
              context: correctedContext,
              target: this.options.proxy[context],
            };
          } else {
            proxyOptions = Object.assign({}, this.options.proxy[context]);
            proxyOptions.context = correctedContext;
          }

          proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

          return proxyOptions;
        });
      }
    }

    const getProxyMiddleware = (proxyConfig) => {
      const context = proxyConfig.context || proxyConfig.path;

      // It is possible to use the `bypass` method without a `target`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        return httpProxyMiddleware(context, proxyConfig);
      }
    };
    /**
     * Assume a proxy configuration specified as:
     * proxy: [
     *   {
     *     context: ...,
     *     ...options...
     *   },
     *   // or:
     *   function() {
     *     return {
     *       context: ...,
     *       ...options...
     *     };
     *   }
     * ]
     */
    this.options.proxy.forEach((proxyConfigOrCallback) => {
      let proxyMiddleware;

      let proxyConfig =
        typeof proxyConfigOrCallback === 'function'
          ? proxyConfigOrCallback()
          : proxyConfigOrCallback;

      proxyMiddleware = getProxyMiddleware(proxyConfig);

      if (proxyConfig.ws) {
        this.websocketProxies.push(proxyMiddleware);
      }

      const handle = (req, res, next) => {
        if (typeof proxyConfigOrCallback === 'function') {
          const newProxyConfig = proxyConfigOrCallback();

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;
            proxyMiddleware = getProxyMiddleware(proxyConfig);
          }
        }

        // - Check if we have a bypass function defined
        // - In case the bypass function is defined we'll retrieve the
        // bypassUrl from it otherwise bypassUrl would be null
        const isByPassFuncDefined = typeof proxyConfig.bypass === 'function';
        const bypassUrl = isByPassFuncDefined
          ? proxyConfig.bypass(req, res, proxyConfig)
          : null;

        if (typeof bypassUrl === 'boolean') {
          // skip the proxy
          req.url = null;
          next();
        } else if (typeof bypassUrl === 'string') {
          // byPass to that url
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      };

      this.app.use(handle);
      // Also forward error requests to the proxy so it can handle them.
      this.app.use((error, req, res, next) => handle(req, res, next));
    });
  }
...
```

### progress- CLI only

`boolean`

是否开启webpack的ProgressPlugin插件。

源码位置：

node_modules/webpack-dev-server/lib/Server.js

```js
...
  setupProgressPlugin() {
    // for CLI output
    new webpack.ProgressPlugin({
      profile: !!this.options.profile,
    }).apply(this.compiler);

    // for browser console output
    new webpack.ProgressPlugin((percent, msg, addInfo) => {
      percent = Math.floor(percent * 100);

      if (percent === 100) {
        msg = 'Compilation completed';
      }

      if (addInfo) {
        msg = `${msg} (${addInfo})`;
      }

      this.sockWrite(this.sockets, 'progress-update', { percent, msg });

      if (this.listeningApp) {
        this.listeningApp.emit('progress-update', { percent, msg });
      }
    }).apply(this.compiler);
  }
...
```

### public

`string`

当使用*内联模式(inline mode)*并代理 dev-server 时，内联的客户端脚本并不总是知道要连接到什么地方。它会尝试根据 `window.location` 来猜测服务器的 URL，但是如果失败，你需要这样。

例如，dev-server 被代理到 nginx，并且在 `myapp.test` 上可用：

```js
public: "myapp.test:80"
```

Usage via the CLI

```bash
webpack-dev-server --public myapp.test:80
```

什么意思呢？我们看一下源码就知道了：

node_modules/webpack-dev-server/lib/Server.js

```js
 checkHeaders(headers, headerToCheck) {
    if (this.disableHostCheck) {
      return true;
    }
   ...
    // also allow public hostname if provided
    if (typeof this.publicHost === 'string') {
      const idxPublic = this.publicHost.indexOf(':');
      const publicHostname =
        idxPublic >= 0 ? this.publicHost.substr(0, idxPublic) : this.publicHost;

      if (hostname === publicHostname) {
        return true;
      }
    }

    // disallow
    return false;
  }
```

也就是说比如：我们配置了80端口，那别人访问“http://myapp.test”没加80端口的时候默认是访问不到的，但是我们可以设置让不加80端口也可以访问：

```js
public: "myapp.test:80"
```

### publicPath 🔑

`string="\"`

我们默认运行webpack-dev-server的时候，打好的文件我们是可以直接通过链接访问的，比如我们的demo，我们运行webpack-dev-server：

```bash
...
Built at: 2020-07-12 15:31:06
                                       Asset      Size
app.45d164a45ace2e8a.2e0aaba2b08fe1a4.app.js   677 KiB  [emitted] [immutable]        [name: app]
      app.fccb26fdfc9f835794e4.hot-update.js   278 KiB  [emitted] [immutable]
[hmr]  [name: app]
        fccb26fdfc9f835794e4.hot-update.json  54 bytes  [emitted] [immutable]
[hmr]
 + 1 hidden asset
Entrypoint app = app.45d164a45ace2e8a.2e0aaba2b08fe1a4.app.js app.fccb26fdfc9f835794e4.hot-update.js (63fe41824cb8236c0896a71b7df7f461.png)
./index.js 271 bytes [built]
    + 57 hidden modules
ℹ ｢wdm｣: Compiled successfully.

```

可以看到，打好了三个文件：

```
app.45d164a45ace2e8a.2e0aaba2b08fe1a4.app.js
pp.fccb26fdfc9f835794e4.hot-update.js
 fccb26fdfc9f835794e4.hot-update.json
```

我们可以直接在浏览器中访问，比如：http://127.0.0.1:8090/app.45d164a45ace2e8a.2e0aaba2b08fe1a4.app.js

如果我们需要在中间在加一个目录的话，我们可以怎么做呢？是的！ 我们在上一篇文章中也有说过一个ouput.filename的属性，所以我们可以这样：

webpack.config.js：

```js
output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "dist/[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        // library: "demoSay",
        // libraryExport: "default",
        // libraryTarget: "jsonp",

    },
```

在filename字段上加了一个目录“dist”，

然后运行webpack-dev-server：

```bash
Built at: 2020-07-12 15:36:28
                                            Asset      Size
             63fe41824cb8236c0896a71b7df7f461.png  59.3 KiB  [emitted]              [name: (app)]
dist/app.45d164a45ace2e8a.eb72e79c44655777.app.js   677 KiB  [emitted] [immutable]  [name: app]
Entrypoint app = dist/app.45d164a45ace2e8a.eb72e79c44655777.app.js (63fe41824cb8236c0896a71b7df7f461.png)
./index.js 271 bytes [built]

```

可以看到，打包好了一个“dist/app.45d164a45ace2e8a.eb72e79c44655777.app.js ”文件，我们可以直接在浏览器中访问：“http://127.0.0.1:8090/dist/app.45d164a45ace2e8a.eb72e79c44655777.app.js”。

ok！ 除了改output.filename，我们还可以直接修改devServer的publicPath目录：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: ["./index.js"]
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        // library: "demoSay",
        // libraryExport: "default",
        // libraryTarget: "jsonp",

    },
    experiments: {
        // outputModule: true
    },
    module: {
        noParse: /babel-polyfill/,
        rules: [
            {
                test: /.vue$/,
                use: 'vue-loader',
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            config: {
                                path: path.resolve(__dirname, "./postcss.config.js")
                            }
                        }
                    },
                    "sass-loader"
                ],
            },
            {
                test: /\.png$/,
                oneOf: [
                    {
                        resourceQuery: /inline/,
                        loader: "url-loader",
                        options: {
                            limit: 1024 * 1024 * 10
                        }
                    },
                    {
                        resourceQuery: /external/,
                        loader: "file-loader",
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            DemoVue: path.resolve(__dirname, "./src/demo-vue.vue")
        },
        extensions: ['.wasm', '.mjs', '.js', '.json', '.vue'],
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        unsafeCache: /demo-publicpath/,
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ],
    devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"),
        // contentBasePublicPath: "/assets",
        filename: /app\.js/,
        headers: {
            'X-Custom-Foo': 'bar'
        },
        historyApiFallback: true,
        host: "0.0.0.0",
        port: "8090",
        hot: true,
        liveReload: false,
        // open: {
        //     app: ["firefox"]
        // },
        overlay: true,
        publicPath: "/dist/"
    }
};
```

### useLocalIp

`boolean=false`

是否运行打开页面的时候使用本地ip：

```js
 devServer: {
        before(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        },
        after(app, server, compiler) {
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        },
        clientLogLevel: "info",
        allowedHosts: [
            "localhost"
        ],
        contentBase: path.join(process.cwd(), "lib"),
        // contentBasePublicPath: "/assets",
        filename: /app\.js/,
        headers: {
            'X-Custom-Foo': 'bar'
        },
        historyApiFallback: true,
        host: "0.0.0.0",
        port: "8090",
        hot: true,
        liveReload: false,
        open: true,
        useLocalIp: true,
        overlay: true,
        publicPath: "/dist/"
    }
```

当我们运行webpack-dev-server的时候，浏览器就会默认打开：http://192.168.2.103:8090/页面了（我电脑本地ip:192.168.2.103）。

### watchContentBase

`boolean=false`

是否监听contentBase目录的变化，前面我们分析过contentBase配置（静态目录），默认静态目录变化的时候当我们开启hot模式的时候是不会刷新页面的，但是我们可以设置watchContentBase=true来监听静态目录的变化来做到页面的自动刷新。

👌，webpack-dev-server内容我们就介绍到这里了，还有一些其它的配置我们就不一一分析了，大家自己根据官网和源码走一遍demo就ok了。

本节到这里就结束了，后面会对剩下的devtool、watch、externals等等再做分析，敬请期待！

