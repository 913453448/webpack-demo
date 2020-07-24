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

### splitChunks

> By default webpack v4+ provides new common chunks strategies out of the box for dynamically imported modules. See available options for configuring this behavior in the [SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/) page.

在webpack4之前我们如果需要自定义拆分包规则的话用的是[commons-chunk-plugin](https://webpack.js.org/plugins/commons-chunk-plugin/)插件，webpack4以后内置了[SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/) 插件用于包规则处理。

在介绍[SplitChunksPlugin](https://webpack.js.org/plugins/split-chunks-plugin/)之前我们先安装一下webpack的一个包处理插件`webpack-bundle-analyzer`:

```bash
yarn add -D webpack-bundle-analyzer
```

然后我们修改一下配置文件webpack-chain.js：

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
        .minimize(true)
        .minimizer("terser")
            .use(require("terser-webpack-plugin"),[{
                extractComments: false,
                terserOptions:{
                    output: {
                        comments: false
                    }
                }
            }]);
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

可看到，打包完毕后会帮我们自动打开一个包分析页面，会把所有的chunk列出来，然后依赖关系也展示出来：

![analyzer1](/Users/ocj1/doc/h5/study/webpack/webpack-demo/analyzer1.png)

OK，在分析`splitChunks`配置之前我们先弄清楚几个概念：

- `module`：引入的模块，也就是你用require跟import引入的代码。
- `chunk`：webpack根据入口文件结合配置信息对`module`的一个拆分，也就是说chunk是module的集合。
- `bundle`：bundle是webpack对chunk进行编译压缩打包等处理过后的产物。

了解玩这些概念后，我们看一下webpack对`splitChunks`默认配置：

lib/WebpackOptionsDefaulter.js

```js
...
this.set("optimization.splitChunks", {});
		this.set("optimization.splitChunks.hidePathInfo", "make", options => {
			return isProductionLikeMode(options);
		});
		this.set("optimization.splitChunks.chunks", "async");
		this.set("optimization.splitChunks.minChunks", 1);
		this.set("optimization.splitChunks.minSize", "make", options => {
			return isProductionLikeMode(options) ? 30000 : 10000;
		});
		this.set("optimization.splitChunks.minRemainingSize", "make", options => {
			return options.mode === "development" ? 0 : undefined;
		});
		this.set("optimization.splitChunks.maxAsyncRequests", "make", options => {
			return isProductionLikeMode(options) ? 6 : Infinity;
		});
		this.set("optimization.splitChunks.automaticNameDelimiter", "-");
		this.set("optimization.splitChunks.maxInitialRequests", "make", options => {
			return isProductionLikeMode(options) ? 4 : Infinity;
		});
		this.set("optimization.splitChunks.cacheGroups", {});
		this.set("optimization.splitChunks.cacheGroups.default", {
			idHint: "",
			reuseExistingChunk: true,
			minChunks: 2,
			priority: -20
		});
		this.set("optimization.splitChunks.cacheGroups.defaultVendors", {
			idHint: "vendors",
			reuseExistingChunk: true,
			test: NODE_MODULES_REGEXP,
			priority: -10
		});
...
```

我们先感受一下默认`splitChunks`对我们当前项目的chunk处理，配置文件，

webpack-chain.js：

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
            .end()
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

然后执行webpack编译：

```
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.0da7d4017a7c8ff8.f56afc3595db81f3.app.js
├── demo-vue_vue.js
└── vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js
```

可以看到，多了一个“vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js”文件，那么这个文件是干什么的呢？

![analyzer-vendor](/Users/ocj1/doc/h5/study/webpack/webpack-demo/analyzer-vendor.png)

ok, 我们通过包分析器发现这个文件中包含的都是“demo-vue_vue.js”文件中的一些`node_modules`下面的一些依赖，而我们的“demo-vue_vue.js”文件又是入口文件“app.0da7d4017a7c8ff8.f56afc3595db81f3.app.js”中的一个异步模块，我们打开“app.0da7d4017a7c8ff8.f56afc3595db81f3.app.js”文件稍微瞄一眼：

app.0da7d4017a7c8ff8.f56afc3595db81f3.app.js

```js
...
 "demo-view":()=>Promise.all(/* import() */[__webpack_require__.e("vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d"), __webpack_require__.e("demo-vue_vue")]).then(__webpack_require__.bind(null, "./demo-vue.vue"))\n    },\n    render:(h)=>h("demo-view")\n});\n\n//# sourceURL=webpack:///./index.js?')}},
...
```

可以看到，我们的异步组件被当成了异步模块加载到了app.js入口文件中，也就是说如果需要加载“demo-view”组件的话，需要加载“vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js”跟“./demo-vue.vue”文件。

那么webpack是怎么把我们的“demo-vue.vue”异步组件又拆分出来了一个“vendors-xxx”文件的呢？

先提前透露一下哈，是以下webpack默认配置起的作用：

```js
...
const NODE_MODULES_REGEXP = /[\\/]node_modules[\\/]/i;
...
	//只对异步模块做拆分处理，也就是我们的异步组件（demo-vue.vue）
	this.set("optimization.splitChunks.chunks", "async");
	//当前异步组件（demo-vue.vue）中依赖的module的最小数量为1
		this.set("optimization.splitChunks.minChunks", 1);
//分离出来的chunk需要满足的最小尺寸（因为我们demo中的mode为“development”，所以为9.765625kb）
		this.set("optimization.splitChunks.minSize", "make", options => {
			return isProductionLikeMode(options) ? 30000 : 10000;
		});
//需要从异步组件（demo-vue.vue）中的哪些模块，默认是“NODE_MODULES_REGEXP”，也就是node_modules底下的模块
this.set("optimization.splitChunks.cacheGroups.defaultVendors", {
			idHint: "vendors",
			reuseExistingChunk: true,
			test: NODE_MODULES_REGEXP,
			priority: -10
		});
...
```

```bash
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.0da7d4017a7c8ff8.f56afc3595db81f3.app.js
├── demo-vue_vue.js
└── vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js
```

- 63fe41824cb8236c0896a71b7df7f461.png：src/demo-vue.vue中引入的图片

  ```js
    pubImg: require("../pub1.png?external").default
  ```

- app.0da7d4017a7c8ff8.f56afc3595db81f3.app.js：入口文件生成

- demo-vue_vue.js：入口文件中的异步模块

  ```js
  ...
  const app=new Vue({
      el: "#app",
      components:{
        "demo-view":()=>import("./demo-vue")
      },
      render:(h)=>h("demo-view")
  });
  ...
  ```

- vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js：webpack利用了默认的splitChunks配置从demo-vue_vue.js文件中分离出来的。

好啦！ 可能有些小伙伴要晕了，没关系，我们先提前感受一下，我们下面分析一下splitChunks每个属性的含义。

#### chunks

`function (chunk)` `string`

指定需要从哪些模块中进行拆包处理，

- async：表示只从异步加载得模块（动态加载import()）里面进行拆分
- initial：表示只从入口模块进行拆分
- all：表示以上两者都包括

##### async

webpack默认是“async”配置，前面我们也用到了，会把异步组件中node_module下的依赖都打到vendors中，我们用一下“initial”试试：

##### initial

webpack-chain.js

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
            .end()
        .splitChunks({
            chunks: "initial"
        })
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

然后执行webpack看结果：

```bash
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.7d5989fc2077821e.6b708c2c1d07233a.app.js
├── demo-vue_vue.js
└── vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.6b708c2c1d07233a.vendors-node_modules_vue_dist_vue_runtime_esm_js.js

0 directories, 4 files

```

先看一下我们的入口文件，src/index.js:

```js
__webpack_public_path__ = "/";
import Vue from "vue";
import "demo-publicpath";
const root=document.createElement("div");
root.id="app";
document.body.appendChild(root)
const app=new Vue({
    el: "#app",
    components:{
      "demo-view":()=>import("./demo-vue")
    },
    render:(h)=>h("demo-view")
});
```

按照我们的配置文件跟splitChunks的默认配置，webpack会帮我们把入口文件中node_modules下：

```js
import Vue from "vue";
```

vue模块单独打包到vendors文件中，也就是最后生成的“vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.6b708c2c1d07233a.vendors-node_modules_vue_dist_vue_runtime_esm_js.js”文件。

##### all

我们继续修改配置文件，把chunks改成“all”，

webpack-chain.js：

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
            .end()
        .splitChunks({
            chunks: "all"
        })
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

然后webpack编译打包：

```bash
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.58e33a3bd925d2c6.13725b5e05d55c03.app.js
├── demo-vue_vue.js
├── vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js
└── vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.13725b5e05d55c03.vendors-node_modules_vue_dist_vue_runtime_esm_js.js

0 directories, 5 files

```

可以看到，最后生成了5个文件，

- vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js：异步组件demo-vue.vue中node_modules下的依赖。
- vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.13725b5e05d55c03.vendors-node_modules_vue_dist_vue_runtime_esm_js.js：入口文件index.js中node_modules下的依赖。

##### function

你可以指定function并且按照自己规则选择哪些chunk需要进行拆包处理，比如我们这里只让入口app进行拆包处理，

webpack-chain.js：

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
            .end()
        .splitChunks({
            chunks: (chunk)=>{
                return chunk.name === "app";
            }
        })
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

然后打包处理就只会提取入口文件中的chunk：

```bash
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.8cdd90e710751419.a59d0fe7901eaea9.app.js
├── demo-view.js
└── vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.a59d0fe7901eaea9.vendors-node_modules_vue_dist_vue_runtime_esm_js.js

0 directories, 4 files

```

如果我们只需要处理异步组件中的chunk，首先我们给我们的异步组件给定一个name，不然没法做判断，

src/index.js:

```js
...
const app=new Vue({
    el: "#app",
    components:{
      "demo-view":()=>import(/* webpackChunkName: "demo-vue" */ "./demo-vue")
    },
    render:(h)=>h("demo-view")
});
```

我们给了异步组件chunkname为“demo-view”，然后我们判断当chunk的name为“app”跟“demo-vue”的时候进行拆包处理，

webpack-chain.js:

```js
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
            .end()
        .splitChunks({
            chunks: (chunk)=>{
                return chunk.name === "app" || chunk.name==="demo-vue";
            }
        })
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

然后执行打包：

```js
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.f2a53484c6605e60.ddc69c26cfb6b94c.app.js
├── demo-vue.js
├── vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js
└── vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.ddc69c26cfb6b94c.vendors-node_modules_vue_dist_vue_runtime_esm_js.js

0 directories, 5 files

```

ok, 可以看到，同时对我们的入口“app”跟异步组件“demo-vue”进行了拆包处理。

#### cacheGroups

splitChunks会根据cacheGroups去进行拆包处理，splitChunks默认有两个缓存组：vender和default，可以再来回顾一下splitChunks的默认配置：

```js
this.set("optimization.splitChunks.cacheGroups.default", {
			idHint: "",
			reuseExistingChunk: true,
			minChunks: 2,
			priority: -20
		});
		this.set("optimization.splitChunks.cacheGroups.defaultVendors", {
			idHint: "vendors",
			reuseExistingChunk: true,
			test: NODE_MODULES_REGEXP,
			priority: -10
		});
```

ok，我们的vendors是一直在起作用，但是default貌似没啥作用？

那是因为default中配置了“minChunks: 2”，也就是出现重复两次的公共模块才会被拆分。

ok，我们copy一份"src/index.js"叫"src/index2.js",然后在webpack中添加一个入口app2, 把chunks改成“all”

webpack-chain.js:

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
    .entry("app2")
        .add("./index2.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(false)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    .module
        .noParse(/polyfill/)
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
            .end()
        .splitChunks({
            chunks: "all",
        })
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

我们先看一下我们的入口文件index.js:

```js
__webpack_public_path__ = "/";
import Vue from "vue";
import "demo-publicpath";
const root=document.createElement("div");
root.id="app";
document.body.appendChild(root)
const app=new Vue({
    el: "#app",
    components:{
      "demo-view":()=>import(/* webpackChunkName: "demo-vue" */ "./demo-vue")
    },
    render:(h)=>h("demo-view")
});
```

index2.js文件内容跟index.js一样，可以发现两个入口文件都依赖了“demo-publicpath”模块：

```js
import "demo-publicpath";
```

所以默认的cacheGroups中的default应该是会起作用的，我们来试试，

我们直接webpack打包：

```js
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.f2a53484c6605e60.5634fdc906df69a3.app.js
├── app2.720bd2c9436db62f.5634fdc906df69a3.app2.js
├── demo-vue.js
├── vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js
└── vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.5634fdc906df69a3.vendors-node_modules_vue_dist_vue_runtime_esm_js.js

0 directories, 6 files

```

可以看到，只多了一个app2入口，但是app1跟app2中共用的“demo-publicpath.js”并没有被单独拆出来，这是为什么呢？

因为在webpack的默认配置中，splitChunks的最小size是10kb，我们的“demo-publicpath.js”模块大小不够。

好啦！ 知道原因后，那我们就往“demo-publicpath.js”中多添加点内容，我们直接去copy一份polyfill的源码到src/assets目录，然后在“demo-publicpath.js”中导入polyfill，

src/demo-publicpath.js:

```js
import "./assets/polyfill";
export const say = () => {
    document.body.append(document.createTextNode("hello webpack"))
}
```

然后再执行webpack打包：

```bash
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.7eb0f7d54d50246d.380c5a33877e21dc.app.js
├── app2.2746d1497b7d22f2.380c5a33877e21dc.app2.js
├── demo-publicpath_js.ca83113eaf484d9f.380c5a33877e21dc.demo-publicpath_js.js
├── demo-vue.js
├── vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js
└── vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.380c5a33877e21dc.vendors-node_modules_vue_dist_vue_runtime_esm_js.js

0 directories, 7 files

```

👌，可以看到，app跟app2中共有的“demo-publicpath.js”模块被单独打包成了“demo-publicpath_js.ca83113eaf484d9f.380c5a33877e21dc.demo-publicpath_js.js”文件。

好啦～ 说了这里有小伙伴要提出疑问了，为什么我们需要单独copy一份polyfill源码到src/assets呢？我们直接去导入node_modules下面的难道不行吗？

我们试试看！ 我们修改一下polyfill的导入形式，改成从node_modules导入：

src/demo-publicpath.js

```js
import "babel-polyfill/dist/polyfill";
export const say = () => {
    document.body.append(document.createTextNode("hello webpack"))
}
```

然后我们webpack编译打包：

```bash
./lib
├── 63fe41824cb8236c0896a71b7df7f461.png
├── app.62234a61ae4b51ea.d1e25902f2ab5db9.app.js
├── app2.50e3c79cb0103ebc.d1e25902f2ab5db9.app2.js
├── demo-vue.js
├── vendors-node_modules_babel-polyfill_dist_polyfill_js-node_modules_vue_dist_vue_runtime_esm_js.c2493861c2404ba0.d1e25902f2ab5db9.vendors-node_modules_babel-polyfill_dist_polyfill_js-node_modules_vue_dist_vue_runtime_esm_js.js
└── vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js

0 directories, 6 files

```

可以看到，default又不起作用了，那我们的polyfill到底去哪了呢？ 没错！ 到vendors里面去了，也就是生成的“vendors-node_modules_babel-polyfill_dist_polyfill_js-node_modules_vue_dist_vue_runtime_esm_js.c2493861c2404ba0.d1e25902f2ab5db9.vendors-node_modules_babel-polyfill_dist_polyfill_js-node_modules_vue_dist_vue_runtime_esm_js.js”文件，为什么呢？

因为在默认的配置中vendors的优先级是高于default的，优先级的配置是通过priority属性：

```js
this.set("optimization.splitChunks.cacheGroups.default", {
			idHint: "",
			reuseExistingChunk: true,
			minChunks: 2,
			priority: -20
		});
		this.set("optimization.splitChunks.cacheGroups.defaultVendors", {
			idHint: "vendors",
			reuseExistingChunk: true,
			test: NODE_MODULES_REGEXP,
			priority: -10
		});
```

所以为了让default起作用，我们才会把polyfill复制了一份放到了src/assets让“demo-publicpath.js”导入。

有没有发现webpack默认拆分出来的chunk名字又长又丑呢？我们可以通过name属性去修改默认的name：

webpack-chain.js

```js
.splitChunks({
            chunks: "all",
            cacheGroups: {
                default: {
                    idHint: "",
                    reuseExistingChunk: true,
                    minChunks: 2,
                    priority: -20,
                    name: (module, chunks, cacheGroupKey)=>{
                        return "chunk-common";
                    }
                }
            }
```

效果就不演示了，小伙伴自己去运行。

ok，如果不想用默认cacheGroups的“default”跟“vendors”配置的话，我们只需要将它们置成false就可以了，

```js
 .splitChunks({
          	...
            cacheGroups: {
                default: false,
                defaultVendors: false
            }
        })
```



#### maxInitialRequests

表示允许入口并行加载的最大请求数,之所以有这个配置也是为了对拆分数量进行限制，不至于拆分出太多模块导致请求数量过多而得不偿失。

这里需要注意几点：

- 入口文件本身算一个请求
- 如果入口里面有动态加载得模块这个不算在内
- 通过runtimeChunk拆分出的runtime不算在内
- 只算js文件的请求，css不算在内
- 如果同时又两个模块满足cacheGroup的规则要进行拆分，但是maxInitialRequests的值只能允许再拆分一个模块，那尺寸更大的模块会被拆分出来

看一下webpack默认配置：

```js
...
this.set("optimization.splitChunks.maxInitialRequests", "make", options => {
  //生产环境是4个，测试环境不限制
			return isProductionLikeMode(options) ? 4 : Infinity;
		});
...
```

demo当前配置：

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
    .entry("app2")
        .add("./index2.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(false)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    .module
        .noParse(/polyfill/)
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
            .end()
        .splitChunks({
            chunks: "all",
            cacheGroups: {
                default: {
                    idHint: "",
                    reuseExistingChunk: true,
                    minChunks: 2,
                    priority: -20,
                    name: (module, chunks, cacheGroupKey)=>{
                        return "commons";
                    }
                }
            }
        })
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

然后webpack打包后会生成：

```bash
63fe41824cb8236c0896a71b7df7f461.png
app.0287e18f3a59d8de.032bbe1fbfafc5e2.app.js
app2.58808f5a4e707707.032bbe1fbfafc5e2.app2.js
commons.cfe1450bd9c9d2ff.032bbe1fbfafc5e2.commons.js
demo-vue.js
vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js
vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.032bbe1fbfafc5e2.vendors-node_modules_vue_dist_vue_runtime_esm_js.js
```

入口app的requests有：

- app.0287e18f3a59d8de.032bbe1fbfafc5e2.app.js
- commons.cfe1450bd9c9d2ff.032bbe1fbfafc5e2.commons.js
- vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.032bbe1fbfafc5e2.vendors-node_modules_vue_dist_vue_runtime_esm_js.js

app2跟app一样，`maxInitialRequests`默认是4，所以可以正常分离出“commons.cfe1450bd9c9d2ff.032bbe1fbfafc5e2.commons.js”，如果我们将`maxInitialRequests`设置“2”试试，

webpack-chain.js:

```js
 .splitChunks({
            chunks: "all",
            maxInitialRequests: 2,
            cacheGroups: {
                default: {
                    idHint: "",
                    reuseExistingChunk: true,
                    minChunks: 2,
                    priority: -20,
                    name: (module, chunks, cacheGroupKey)=>{
                        return "commons";
                    }
                }
            }
        })
```

webpack编译看结果：

```js
63fe41824cb8236c0896a71b7df7f461.png
app.0644d4709680673b.2d87a8324473e235.app.js
app2.0c27f9cb5e923e85.2d87a8324473e235.app2.js
demo-vue.js
vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js
vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.2d87a8324473e235.vendors-node_modules_vue_dist_vue_runtime_esm_js.js
```

可以看到，“commons”并没有被分离出来。

#### maxAsyncRequests

maxAsyncRequests跟maxInitialRequests差不多，maxAsyncRequests主要是用来限制异步模块内部的并行最大请求数的。

在我们demo中指的就是“demo-vue.vue”异步组件，目前demo-vue.vue的requests有：

1. demo-vue.js
2. vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js

有小伙伴要疑问了“难道异步组件不需要依赖vue吗？”，也就是“vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.2d87a8324473e235.vendors-node_modules_vue_dist_vue_runtime_esm_js.js”文件，因为在入口文件中也有依赖vue，所以webpack认为vue是必须存在的，因此不算在里面。

ok, 如果我们把maxAsyncRequests改成“1”看一下还会分离“vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js”文件吗？

```bash
63fe41824cb8236c0896a71b7df7f461.png
app.425e43abcaba52da.cd98b0378c0ec2df.app.js
app2.ca0b00010af3e31c.cd98b0378c0ec2df.app2.js
demo-vue.js
vendors-node_modules_vue_dist_vue_runtime_esm_js.1c5043955daac720.cd98b0378c0ec2df.vendors-node_modules_vue_dist_vue_runtime_esm_js.js
```

可以看到，最后“vendors-node_modules_css-loader_dist_runtime_api_js-node_modules_style-loader_dist_runtime_in-e18f0d.js”文件没有生成，此时demo-vue.vue（异步组件）的requests有：

1. demo-vue.js

## 实战

ok！说了那么多概念性的东西，我们结合demo来点平时项目中会用到的配置，比如我们demo这里，目前有两个入口“app”跟“app1”，分包规则如下：

1. node_modules底下的依赖跟polyfill都放入一个叫“chunk-vendors”的包中
2. 引用次数超过两次的放入到“chunk-common”包中。

ok, 了解完需求后我们直接修改一下配置文件：

webpack-chain.js：

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
    .entry("app2")
        .add("./index2.js")
        .end()
    .output
        .path(path.join(process.cwd(), "lib"))
        .pathinfo(false)
        .filename("[name].[contenthash:16].[fullhash:16].[id].js")
        .chunkFilename("[id].js")
        .end()
    .set("experiments",{})
    .module
        .noParse(/polyfill/)
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
            .end()
        .splitChunks({
            cacheGroups: {
                vendors: {
                    name: `chunk-vendors`,
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    chunks: 'all'
                },
                common: {
                    name: `chunk-common`,
                    minChunks: 2,
                    priority: -20,
                    chunks: 'all',
                    reuseExistingChunk: true
                }
            }
        })
config.plugin("webpack-bundle-analyzer").use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin,[]);
module.exports = config.toConfig();
```

然后我们webpack打包编译：

```js
63fe41824cb8236c0896a71b7df7f461.png
app.55ad00d0136c7d7d.306645240be8f953.app.js
app2.efd24a48f5ab103e.306645240be8f953.app2.js
chunk-common.3baec624a3539123.306645240be8f953.chunk-common.js
chunk-vendors.js
demo-vue.js
```

- chunk-vendors.js: 包含了node_modules底下的模块（vue、style-loader等等。）
- chunk-common.3baec624a3539123.306645240be8f953.chunk-common.js： 包含了assets/polyfill.js

ok, 我们直接用bundle-analyzer工具查看一下：

chunk-vendors.js

![chunk-vendor](/Users/yinqingyang/前端架构系列之(webpack)/webpack-demo/chunk-vendor.png)

chunk-common.3baec624a3539123.306645240be8f953.chunk-common.js:

![chunk-common](/Users/yinqingyang/前端架构系列之(webpack)/webpack-demo/chunk-common.png)

## 总结

我们花了很多章节来介绍webpack，不得不说webpack内容是真的多，对webpack作者佩服的五体投地，开源不易啊！！

好啦！我们的webpack差不多就告一段落了，后面可能会对vue、react脚手架对webpack的配置做分析，敬请期待！！

