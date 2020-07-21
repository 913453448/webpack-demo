## 前言

前面我们写了几篇文章用来介绍webpack源码，跟着官网结合demo把整个webpack配置撸了一遍：

- [webpack源码解析一](https://vvbug.blog.csdn.net/article/details/103531670)
- [webpack源码解析二（html-webpack-plugin插件）](https://vvbug.blog.csdn.net/article/details/103571985)
- [webpack源码解析三](https://vvbug.blog.csdn.net/article/details/107233952)
- [webpack源码解析四](https://vvbug.blog.csdn.net/article/details/107300928)
- [webpack源码解析五](https://vvbug.blog.csdn.net/article/details/107303380)
- [webpack源码解析六（webpack-chain）](https://vvbug.blog.csdn.net/article/details/107319774)

今天我们结合demo来看一下webpack的[Optimization](https://webpack.js.org/configuration/optimization/)配置。

demo还是前面几节中的: [https://github.com/913453448/webpack-demo.git](https://github.com/913453448/webpack-demo.git)

## optimization

webpack4.0版本后会根据当前配置的[`mode`](https://webpack.js.org/configuration/mode/)对优化操作，你也可以单独配置或者是覆盖默认的配置。

什么意思呢？比如在webpack4之前如果我们需要对打包好的资源进行压缩，可能我们需要单独用到[uglifyjs-webpack-plugin](https://webpack.js.org/plugins/uglifyjs-webpack-plugin/)插件，如果我们需要按规则拆分包可能需要用到[CommonsChunkPlugin](https://webpack.js.org/plugins/commons-chunk-plugin/)等等，由于这些操作在项目中很频繁也很实用，所以webpack干脆就内置到源码变成一个“Optimization”配置选项。

### minimize

`boolean`

是否利用默认的[TerserPlugin](https://webpack.js.org/plugins/terser-webpack-plugin/)插件或者自定义的插件去压缩打包过后的资源文件。

生产环境默认是`true`

可以看一下webpack源码，

webpack/lib/WebpackOptionsDefaulter.js:

```js
...
const isProductionLikeMode = options => {
	return options.mode === "production" || !options.mode;
};
...
this.set("optimization.minimize", "make", options =>
			isProductionLikeMode(options)
		);
...
```

可以看到，`mode`为“production”的时候默认是开启的，我们可以这样设置：

**webpack.config.js**

```js
module.exports = {
  //...
  optimization: {
    minimize: options.mode === "production"
  }
};
```

### minimizer

`[TerserPlugin]` and or `[function (compiler)]`

压缩代码使用的插件，默认是[TerserPlugin](https://webpack.js.org/plugins/terser-webpack-plugin/) ，你也可以使用该选项覆盖默认的插件。

**webpack.config.js**

```js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      }),
    ],
  }
};
```

或者使用方法：

```js
module.exports = {
  optimization: {
    minimizer: [
      (compiler) => {
        const TerserPlugin = require('terser-webpack-plugin');
        new TerserPlugin({ /* your config */ }).apply(compiler);
      }
    ],
  }
};
```

源码位置：

lib/WebpackOptionsDefaulter.js(默认插件)

```js
...
this.set("optimization.minimizer", "make", options => [
			{
				apply: compiler => {
					// Lazy load the Terser plugin
					const TerserPlugin = require("terser-webpack-plugin");
					new TerserPlugin().apply(compiler);
				}
			}
		]);
...
```

lib/WebpackOptionsApply.js：

```js
...
		if (options.optimization.minimize) {
			for (const minimizer of options.optimization.minimizer) {
				if (typeof minimizer === "function") {
					minimizer.call(compiler, compiler);
				} else {
					minimizer.apply(compiler);
				}
			}
		}
...
```

ok！我们结合demo用一下这个选项，首先，我们把`minimize`选项设置成`false`,

webpack-chain.js:

```js
const Config = require('webpack-chain');
const config = new Config();
const path = require("path");

config
    .mode("production")
    .context(path.resolve(__dirname, "./src"))
    .entry("app")
        .add("./index.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(false)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    .module
        // .noParse(/babel-polyfill/)
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

config
    .optimization
        .minimize(false);
module.exports = config.toConfig();
```

然后我们执行webpack：

```bash
➜  webpack-demo git:(master) ✗ npx webpack
Hash: bf5359b2e366b637ed00
Version: webpack 5.0.0-beta.7
Time: 1539ms
Built at: 2020-07-21 15:28:52
                                       Asset      Size
                                      425.js  17.2 KiB  [emitted]
        63fe41824cb8236c0896a71b7df7f461.png  59.3 KiB  [emitted]
app.0ebefcd962170615.bf5359b2e366b637.143.js   210 KiB  [emitted] [immutable]  [name: app]
Entrypoint app = app.0ebefcd962170615.bf5359b2e366b637.143.js
./index.js + 2 modules 222 KiB [built]
./demo-vue.vue + 5 modules 5.05 KiB [built]
./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 824 bytes [built]
../node_modules/style-loader/dist/cjs.js!../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src??ruleSet[0].rules[0].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 810 bytes [built]
../pub1.png?external 80 bytes [built]
../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js 6.64 KiB [built]
../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src??ruleSet[0].rules[0].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 550 bytes [built]
../node_modules/css-loader/dist/runtime/api.js 2.46 KiB [built]
    + 8 hidden modules
➜  webpack-demo git:(master) ✗ 

```

可以看到，在我们lib目录下面生成了三个文件：

```bash
63fe41824cb8236c0896a71b7df7f461.png
425.js
app.0ebefcd962170615.bf5359b2e366b637.143.js
```

我们随便看一个js文件：

lib/app.0ebefcd962170615.bf5359b2e366b637.143.js

```js
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
...
```

ok! 可以看到，代码并没有被压缩，中间还有些注释，这样的代码我们肯定是不能发布的，所以我们用一下webpack默认的压缩，我们直接把`minimize`选择设置成`true`(默认设置)：

webpack-chain.js

```js
...
config
    .optimization
        .minimize(true);
module.exports = config.toConfig();
```

然后我们执行webpack编译看结果：

```bash
./lib
├── 425.js
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.454b4ea21a1d7574.a4f7bd5606571443.143.js
└── app.454b4ea21a1d7574.a4f7bd5606571443.143.js.LICENSE
```

可以看到，lib下面出现了四个文件，

app.454b4ea21a1d7574.a4f7bd5606571443.143.js：

```js
/*! For license information please see app.454b4ea21a1d7574.a4f7bd5606571443.143.js.LICENSE */
(()=>{"use strict";var t={},e={};function n(r){if(e[r])return e[r].exp...
```

可以看到，注释webpack默认都帮我们移到了一个叫“app.454b4ea21a1d7574.a4f7bd5606571443.143.js.LICENSE”文件中，

app.454b4ea21a1d7574.a4f7bd5606571443.143.js.LICENSE：

```js
/*!
 * Vue.js v2.6.11
 * (c) 2014-2019 Evan You
 * Released under the MIT License.
 */

```

ok! 这就是vue的源码中的注释，webpack直接帮我们拎出来了，那如果我们不需要这些注释我们该怎么做呢？ 

我们需要重新修改[TerserPlugin](https://webpack.js.org/plugins/terser-webpack-plugin/) 配置信息，

webpack-chain.js:

```js
...
config
    .optimization
        .minimize(true)
        .minimizer("terser")
            .use(require("terser-webpack-plugin"),[{
                extractComments: false
            }])
module.exports = config.toConfig();
```

👌， 我们运行webpack：

```bash
./lib
├── 425.js
├── 63fe41824cb8236c0896a71b7df7f461.png
└── app.732205f4c110a904.a8ba809e02a92a83.143.js

0 directories, 3 files
```

可以看到，生产了三个文件，另外一个LICENSE文件不见了，我们打开“app.732205f4c110a904.a8ba809e02a92a83.143.js”看看，

app.732205f4c110a904.a8ba809e02a92a83.143.js：

```js
(()=>{"use strict";var t,e={},n={};function r(t){if(n[t])return n[t].exports;var o=n[t...
/*!
 * Vue.js v2.6.11
 * (c) 2014-2019 Evan You
 * Released under the MIT License.
 */
 var o=Object.freeze({});function i(t){return null==t}function a(t){return null!=t}function s(t){return!0===t}function c(t){return"string"==typeof t||"numbe ...                                                                                   
```

可以看到，虽然注释文件没了，但是文件内部的注释并没有去掉，我们修改一下配置文件，

webpack-chain.js:

```js
...
config
    .optimization
        .minimize(true)
        .minimizer("terser")
            .use(require("terser-webpack-plugin"),[{
                extractComments: false,
                terserOptions:{
                    output: {
                        comments: false
                    }
                }
            }])
module.exports = config.toConfig();
```

我们运行webpack看结果：

```js
(()=>{"use strict";var t,e={},n={};function r(t){if(n[t])return...
```

运行的过程我就不演示了，可以看到，编译过后的js文件代码都在一行，并且进行了压缩，去掉了注释。

Terser-webpack-plugin更多的用法大家可以参考官网：[https://webpack.js.org/plugins/terser-webpack-plugin/](https://webpack.js.org/plugins/terser-webpack-plugin/)

