## 前言

前面我们写了几篇文章用来介绍webpack源码，跟着官网结合demo把整个webpack配置撸了一遍：

- [webpack源码解析一](https://vvbug.blog.csdn.net/article/details/103531670)
- [webpack源码解析二（html-webpack-plugin插件）](https://vvbug.blog.csdn.net/article/details/103571985)
- [webpack源码解析三](https://vvbug.blog.csdn.net/article/details/107233952)
- [webpack源码解析四](https://vvbug.blog.csdn.net/article/details/107300928)
- [webpack源码解析五](https://vvbug.blog.csdn.net/article/details/107303380)

今天我们说一下一个关于webpack配置的第三方库[webpack-chain](https://github.com/neutrinojs/webpack-chain),为什么要讲它呢？ 可以借助IDE可以做到智能提示，让我们配置起来不容易出错，而且完全链式语法，用起来比较爽！

## 开始

我们还是接着我们之前章节的[webpack-demo](https://github.com/913453448/webpack-demo.git)继续，[webpack-chain](https://github.com/neutrinojs/webpack-chain)的api用法大家可以简单的先过一下官网，然后看一下我们之前[webpack-demo](https://github.com/913453448/webpack-demo.git)的配置文件，

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"],
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
        new (require("vue-loader-plugin"))(),
        // new (require("uglifyjs-webpack-plugin"))({
        //     test: /\.js($|\?)/i
        // })
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
        liveReload: true,
        open: true,
        useLocalIp: true,
        overlay: true,
    },
    // performance: {
    //     hints: "error",
    //     maxEntrypointSize: 1024
    // }
};

```

👌，这个配置文件我就不分析太多了，因为我是直接用的之前demo的配置文件，不懂的小伙伴可以看看之前的章节。

## 安装

首先在demo根目录安装webpack-chain：

```bash
npm install -D webpack-chain || yarn add -D webpack-chain
```

## 配置

我们在demo根目录创建一个webpack-chain.js的文件，先导出一个config对象：

webpack-chain.js

```js
const Config = require('webpack-chain');
const config = new Config();

module.exports = config.toConfig();
```

我们new了一个webpack-chain的config对象，然后利用toConfig方法是把webpack-chain的config对象转换成webpack的配置对象的方法。

### mode

![chain-mode](/Users/ocj1/doc/h5/study/webpack/webpack-demo/chain-mode.png)

可以看到，当我们用mode方法的时候，IDE直接提示我们value的值有哪些了，是不是很方便呢？

ok！ 我们这里用的是“development”，所以我们直接设置mode的值为“development”（小伙伴可以像我一样，用ide分两屏一左一右对照的来写一遍）。

```js
const Config = require('webpack-chain');
const config = new Config();

config
    .mode("development")

module.exports = config.toConfig();
```

### context

![chain-context](/Users/ocj1/doc/h5/study/webpack/webpack-demo/chain-context.png)

可以看到，ide提示我们输出一个string字符串：

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("development")
    .context(path.resolve(__dirname, "./src"))

module.exports = config.toConfig();
```

Ok! 后面的内容我就不截图了，直接按照提示配置就ok，我就加快节奏了哈～

### entry

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("development")
    .context(path.resolve(__dirname, "./src"))
    .entry("app")
        .add("./index.js")
        .end()
    .
module.exports = config.toConfig();
```

ok，可以看到entry方法返回了一个EntryPoint对象，EntryPoint对象是一个TypedChainedSet集合，所以我们往集合中添加一个字符串“./index.js”，因为TypedChainedSet集合的parent是config对象，所以我们调用end方法退回到config对象。

### output

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("development")
    .context(path.resolve(__dirname, "./src"))
    .entry("app")
        .add("./index.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(true)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    
module.exports = config.toConfig();
```

同样，output配置完毕后直接调用end退出output回到config。

### experiments

这个配置是webpack5才有的，但是我们这里用的webpack-chain还是针对webpack5.0以下版本，那我们怎么办呢？先看一下源文件，

webpack.config.js：

```js
... 
experiments: {
        // outputModule: true
    },
...
```

我们在demo中是注释掉了，因为当初是为了结合output.libraryTarget="module"用的，虽然是注释掉了，我们大不了不传值，所以我们可以这样写：

webpack-chain.js

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("development")
    .context(path.resolve(__dirname, "./src"))
    .entry("app")
        .add("./index.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(true)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    
module.exports = config.toConfig();
```

我们可以直接调用set方法给config设置一个“experiments”属性。

### module

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("development")
    .context(path.resolve(__dirname, "./src"))
    .entry("app")
        .add("./index.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(true)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    .module
        .noParse(/babel-polyfill/)
        .rule("vue")
            .test(/\.vue$/)
            .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)
            .use("style-loader")
                .loader("style-loader")
                .end()
            .use("css-loader")
                .loader("css-loader")
                .end()
            .use("postcss-loader")
                .loader("postcss-loader")
                .options( {
                    config: {
                        path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")
                .loader("sass-loader")
                .end()
            .end()
        .rule("png")
            .test(/\.png$/)
            .oneOf("png-loader")
                .rule("url-loader")
                    .resourceQuery(/inline/)
                    .use("url-loader")
                        .loader("url-loader")
                        .options({
                            limit: 1024 * 1024 * 10
                        })
                        .end()
                    .end()
                .rule("file-loader")
                    .resourceQuery(/external/)
                    .use("file-loader")
                        .loader("file-loader")
                        .end()
                    .end()
                .end()
            .end()
        .end()
module.exports = config.toConfig();
```

ok，这里有点复杂，因为rule是可以嵌套的，不过通过之前文章我们已经充分了解每个配置的用法了，所以还行！！

rules是一个Array<Rule>数组，每一个item是一个Rule，每一个Rule都有test、use等属性，照着ide提示来没啥问题，比如代码最后用了5个end方法去退出到config对象：

1. 第一个end（当前this是Use，退出到Rule）
2. 第二个end（当前this是Rule，退出到oneOf）
3. 第三个end（当前this是oneOf, 退出到Rule）
4. 第四个end （当前this是Rule，退出到Module）
5. 第五个end （当前this是Module，退出到Config）

哈哈～ 我这里是为了一个链式到底，所以才这么干的，小伙伴可以直接结束当前语句，然后利用config去配置接下来的项目。

### resolve

alias是一个对象，所以webpack-chain用的是map集合，extensions是一个数组，所以webpack-chain用的是一个set集合，

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("development")
    .context(path.resolve(__dirname, "./src"))
    .entry("app")
        .add("./index.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(true)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    .module
        .noParse(/babel-polyfill/)
        .rule("vue")
            .test(/\.vue$/)
            .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)
            .use("style-loader")
                .loader("style-loader")
                .end()
            .use("css-loader")
                .loader("css-loader")
                .end()
            .use("postcss-loader")
                .loader("postcss-loader")
                .options( {
                    config: {
                        path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")
                .loader("sass-loader")
                .end()
            .end()
        .rule("png")
            .test(/\.png$/)
            .oneOf("png-loader")
                .rule("url-loader")
                    .resourceQuery(/inline/)
                    .use("url-loader")
                        .loader("url-loader")
                        .options({
                            limit: 1024 * 1024 * 10
                        })
                        .end()
                    .end()
                .rule("file-loader")
                    .resourceQuery(/external/)
                    .use("file-loader")
                        .loader("file-loader")
                        .end()
                    .end()
                .end()
            .end()
        .end()
    .resolve
        .alias
            .set("DemoVue", path.resolve(__dirname, "./src/demo-vue.vue"))
            .end()
        .extensions
            .add(".wasm").add(".mjs").add(".js").add(".json").add(".vue")
            .end()
        .modules
            .add(path.resolve(__dirname, "src")).add("node_modules")
            .end()
        .unsafeCache(/demo-publicpath/)
        .end()
module.exports = config.toConfig();
```

### plugin

config提供了plugin方法，传入标识符会返回一个Plugin对象，里面有use方法，use方法的第一个参数是类，第二个参数是构造函数参数。

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("development")
    .context(path.resolve(__dirname, "./src"))
    .entry("app")
        .add("./index.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(true)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    .module
        .noParse(/babel-polyfill/)
        .rule("vue")
            .test(/\.vue$/)
            .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)
            .use("style-loader")
                .loader("style-loader")
                .end()
            .use("css-loader")
                .loader("css-loader")
                .end()
            .use("postcss-loader")
                .loader("postcss-loader")
                .options( {
                    config: {
                        path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")
                .loader("sass-loader")
                .end()
            .end()
        .rule("png")
            .test(/\.png$/)
            .oneOf("png-loader")
                .rule("url-loader")
                    .resourceQuery(/inline/)
                    .use("url-loader")
                        .loader("url-loader")
                        .options({
                            limit: 1024 * 1024 * 10
                        })
                        .end()
                    .end()
                .rule("file-loader")
                    .resourceQuery(/external/)
                    .use("file-loader")
                        .loader("file-loader")
                        .end()
                    .end()
                .end()
            .end()
        .end()
    .resolve
        .alias
            .set("DemoVue", path.resolve(__dirname, "./src/demo-vue.vue"))
            .end()
        .extensions
            .add(".wasm").add(".mjs").add(".js").add(".json").add(".vue")
            .end()
        .modules
            .add(path.resolve(__dirname, "src")).add("node_modules")
            .end()
        .unsafeCache(/demo-publicpath/)
        .end()
    .plugin("vue-loader-plugin")
        .use(require("vue-loader-plugin"),[])
        .end()
module.exports = config.toConfig();
```

### devServer && performance

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("development")
    .context(path.resolve(__dirname, "./src"))
    .entry("app")
        .add("./index.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(true)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    .module
        .noParse(/babel-polyfill/)
        .rule("vue")
            .test(/\.vue$/)
            .use("vue-loader")
                .loader("vue-loader")
                .end()
            .end()
        .rule("sass")
            .test( /\.(sass|scss)$/)
            .use("style-loader")
                .loader("style-loader")
                .end()
            .use("css-loader")
                .loader("css-loader")
                .end()
            .use("postcss-loader")
                .loader("postcss-loader")
                .options( {
                    config: {
                        path: path.resolve(__dirname, "./postcss.config.js")
                    }
                })
                .end()
            .use("sass-loader")
                .loader("sass-loader")
                .end()
            .end()
        .rule("png")
            .test(/\.png$/)
            .oneOf("png-loader")
                .rule("url-loader")
                    .resourceQuery(/inline/)
                    .use("url-loader")
                        .loader("url-loader")
                        .options({
                            limit: 1024 * 1024 * 10
                        })
                        .end()
                    .end()
                .rule("file-loader")
                    .resourceQuery(/external/)
                    .use("file-loader")
                        .loader("file-loader")
                        .end()
                    .end()
                .end()
            .end()
        .end()
    .resolve
        .alias
            .set("DemoVue", path.resolve(__dirname, "./src/demo-vue.vue"))
            .end()
        .extensions
            .add(".wasm").add(".mjs").add(".js").add(".json").add(".vue")
            .end()
        .modules
            .add(path.resolve(__dirname, "src")).add("node_modules")
            .end()
        .unsafeCache(/demo-publicpath/)
        .end()
    .plugin("vue-loader-plugin")
        .use(require("vue-loader-plugin"),[])
        .end()
    .devServer
        .before((app, server, compiler)=>{
            app.get("/login",(req,res,next)=>{
                req.query.name="hello "+req.query.name;
                next();
            });
        })
        .after((app, server, compiler)=>{
            app.get("/login",(req,res,next)=>{
                res.json({msg: req.query.name});
            });
        })
        .clientLogLevel("info")
        .allowedHosts
            .add("localhost")
            .end()
        .contentBase(path.join(process.cwd(), "lib"))
        .filename(/app\.js/)
        .headers({
            'X-Custom-Foo': 'bar'
        })
        .historyApiFallback(true)
        .host("0.0.0.0")
        .port("8090")
        .hot(true)
        .set("liveReload", true)
        .open(true)
        .useLocalIp(true)
        .overlay(true)
        .end()
    .performance
        .hints("warning")
        .end();
module.exports = config.toConfig();
```

Ok! 全部配置完毕了，我们测试一下，我们修改webpack的配置文件：

webpack.config.js

```js
module.exports=require("./webpack-chain");
```

直接导出一个webpack-chain内容。

运行webpack：

```bash
 webpack-demo git:(master) ✗ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server
ℹ ｢wds｣: Project is running at http://10.22.1.32:8090/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from xxx/webpack-demo/lib
ℹ ｢wds｣: 404s will fallback to /index.html
ℹ ｢wdm｣: wait until bundle finished: /
⚠ ｢wdm｣: Hash: 4bf061b1a05b1d0c9db1
Version: webpack 5.0.0-beta.7
Time: 2847ms
Built at: 2020-07-13 16:23:36
                                       Asset      Size
        63fe41824cb8236c0896a71b7df7f461.png  59.3 KiB  [emitted]                     [name: (app)]
app.a4b9346c31248d4b.4bf061b1a05b1d0c.app.js   675 KiB  [emitted] [immutable]  [big]  [name: app]
Entrypoint app [big] = app.a4b9346c31248d4b.4bf061b1a05b1d0c.app.js (63fe41824cb8236c0896a71b7df7f461.png)
./index.js 271 bytes [built]
(webpack)/node_modules/webpack-dev-server/client?http://10.22.1.32:8090 4.29 KiB [built]
(webpack)/hot/dev-server.js 1.59 KiB [built]
./demo-vue.vue 1.19 KiB [built]
../node_modules/vue/dist/vue.runtime.esm.js 222 KiB [built]
./demo-publicpath.js 95 bytes [built]
(webpack)/node_modules/webpack-dev-server/node_modules/strip-ansi/index.js 161 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/socket.js 1.53 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/overlay.js 3.51 KiB [built]
(webpack)/node_modules/webpack-dev-server/client/utils/log.js 964 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/sendMessage.js 402 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/reloadApp.js 1.59 KiB [built]
(webpack)/hot/emitter.js 75 bytes [built]
(webpack)/node_modules/webpack-dev-server/client/utils/createSocketUrl.js 2.91 KiB [built]
(webpack)/node_modules/webpack/hot sync nonrecursive ^\.\/log$ 170 bytes [built]
    + 43 hidden modules

WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
This can impact web performance.
Assets: 
  app.a4b9346c31248d4b.4bf061b1a05b1d0c.app.js (675 KiB)

WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (244 KiB). This can impact web performance.
Entrypoints:
  app (675 KiB)
      app.a4b9346c31248d4b.4bf061b1a05b1d0c.app.js


WARNING in webpack performance recommendations: 
You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your application.
For more info visit https://webpack.js.org/guides/code-splitting/

ℹ ｢wdm｣: Compiled with warnings.


```

👌～ webpack-chain结合demo我们算是讲完了，我们demo应该算是把webpack-chain内容都覆盖了，说到底关键还是得弄懂webpack的所有配置项目，这样才能把webpack-chain运用自如，我不夸张的说我只看了一遍webpack-chain的api，然后通过ide智能提示完成了整个配置，所以强烈推荐小伙伴看一下之前webpack的文章。

**未完待续，敬请期待！！**