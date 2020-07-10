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

### `color`- CLI only

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

