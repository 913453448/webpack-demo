## 前言

前面写了一篇文章[webpack源码解析一](https://blog.csdn.net/vv_bug/article/details/103531670)梳理了一遍webpack的编译过程，今天我们结合demo来过一遍webpack的所有配置项。

## 开始

为了更好的了解每一个选项的用法我们首先clone一份webpack的源码（demo用的是5.0.0-beta.7版本）：

```
git clone https://github.com/webpack/webpack.git
```

源码clone完毕后在当前页面执行setup操作并且安装webpack-cli：

```js
yarn setup && yarn add webpack-cli -D
```

ok！接着我们创建一个[webpack-demo](https://github.com/913453448/webpack-demo)目录（demo代码上传到github了，也可以直接clone），在当前目录执行npm初始化：

```
mkdir webpack-demo && npm init
```

初始化完毕后我们在根目录创建一个webpack的配置文件`webpack.config.js`,里面默认导出一个空对象，

webpack.config.js:

```js
module.exports = {
}
```

然后我们在根目录创建一个src目录用来存放源码，最后我们直接在项目根目录去依赖webpack的源码：

```js
npm install -D xxx/webpack/webpack-src
```

依赖完毕后我们在根目录执行webpack测试一下：

```js
➜  webpack-demo git:(master) ✗ npx webpack
Hash: 2b5ba38fa93a63c41d7d
Version: webpack 5.0.0-beta.7
Time: 58ms
Built at: 2020-07-07 14:11:47
1 asset
Entrypoint main = main.js

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

ERROR in main
Module not found: Error: Can't resolve './src' in 'xxx/webpack/webpack-demo'

```

可以看到，报了一个错误跟一个警告，说我们没有设置`mode`选项、src底下没有发现模块信息，ok！ 下面我们正式进入到webpack的配置选项。

## 配置

### 模式（mode）

`string： developme、production（）、none`

| Option        | Description                                                  |
| :------------ | :----------------------------------------------------------- |
| `development` | 利用 `DefinePlugin`插件设置`process.env.NODE_ENV` 值为 `development` . 打开 `NamedChunksPlugin` and `NamedModulesPlugin` 插件 |
| `production`  | 利用 `DefinePlugin`插件设置`process.env.NODE_ENV` 值为 `production` . 打开 `FlagDependencyUsagePlugin` , `FlagIncludedChunksPlugin` , `ModuleConcatenationPlugin` , `NoEmitOnErrorsPlugin` , `OccurrenceOrderPlugin` , `SideEffectsFlagPlugin` and `TerserPlugin` 插件。 |
| `none`        | Opts out of any default optimization options                 |

#### Mode: development

```diff
// webpack.development.config.js
module.exports = {
+ mode: 'development'
- devtool: 'eval',
- cache: true,
- performance: {
-   hints: false
- },
- output: {
-   pathinfo: true
- },
- optimization: {
-   namedModules: true,
-   namedChunks: true,
-   nodeEnv: 'development',
-   flagIncludedChunks: false,
-   occurrenceOrder: false,
-   concatenateModules: false,
-   splitChunks: {
-     hidePathInfo: false,
-     minSize: 10000,
-     maxAsyncRequests: Infinity,
-     maxInitialRequests: Infinity,
-   },
-   noEmitOnErrors: false,
-   checkWasmTypes: false,
-   minimize: false,
-   removeAvailableModules: false
- },
- plugins: [
-   new webpack.NamedModulesPlugin(),
-   new webpack.NamedChunksPlugin(),
-   new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("development") }),
- ]
}
```

#### Mode: production

```diff
// webpack.production.config.js
module.exports = {
+  mode: 'production',
- performance: {
-   hints: 'warning'
- },
- output: {
-   pathinfo: false
- },
- optimization: {
-   namedModules: false,
-   namedChunks: false,
-   nodeEnv: 'production',
-   flagIncludedChunks: true,
-   occurrenceOrder: true,
-   concatenateModules: true,
-   splitChunks: {
-     hidePathInfo: true,
-     minSize: 30000,
-     maxAsyncRequests: 5,
-     maxInitialRequests: 3,
-   },
-   noEmitOnErrors: true,
-   checkWasmTypes: true,
-   minimize: true,
- },
- plugins: [
-   new TerserPlugin(/* ... */),
-   new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
-   new webpack.optimize.ModuleConcatenationPlugin(),
-   new webpack.NoEmitOnErrorsPlugin()
- ]
}
```

#### Mode: none

```diff
// webpack.custom.config.js
module.exports = {
+ mode: 'none',
- performance: {
-  hints: false
- },
- optimization: {
-   flagIncludedChunks: false,
-   occurrenceOrder: false,
-   concatenateModules: false,
-   splitChunks: {
-     hidePathInfo: false,
-     minSize: 10000,
-     maxAsyncRequests: Infinity,
-     maxInitialRequests: Infinity,
-   },
-   noEmitOnErrors: false,
-   checkWasmTypes: false,
-   minimize: false,
- },
- plugins: []
}
```

👌，我们暂时先不分析每一个插件的用法，后面会讲到，我们直接把demo的mode设置成`development`：

```js
module.exports = {
    mode: "development"
};
```

然后再运行我们会发现警告没有了：

```js
 webpack-demo git:(master) ✗ npx webpack
Hash: 52512bca8884d07d6c74
Version: webpack 5.0.0-beta.7
Time: 55ms
Built at: 2020-07-07 14:29:16
  Asset      Size
main.js  77 bytes  [compared for emit]  [name: main]
Entrypoint main = main.js

ERROR in main
Module not found: Error: Can't resolve './src' in 'xxx/webpack/webpack-demo'

➜  webpack-demo git:(master) ✗ 

```

如果你想根据 **mode** 变量值来配置 *webpack.config.js*, 你可以在配置文件中导出方法而不是变量:

```js
const config = {
};
module.exports = (env, argv) => {
    console.log(argv.mode)
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }
    if (argv.mode === 'production') {
        //...
    }

    return config;
};
```

运行webpack看结果：

```js
➜  webpack-demo git:(master) ✗ npx webpack --mode development
development
Hash: f6a2edaae6eeb526600f
Version: webpack 5.0.0-beta.7
Time: 41ms
Built at: 2020-07-07 14:45:01
      Asset       Size
    main.js  110 bytes  [compared for emit]        [name: main]
main.js.map   84 bytes  [compared for emit] [dev]  [name: (main)]
Entrypoint main = main.js (main.js.map)

ERROR in main
Module not found: Error: Can't resolve './src' in 'xxx/webpack/webpack-demo'

➜  webpack-demo git:(master) ✗ 

```

#### 源码

xxx/webpack-src/lib/webpack.js:

```js
...
const createCompiler = options => {
	options = new WebpackOptionsDefaulter().process(options);
	...
	compiler.options = new WebpackOptionsApply().process(options, compiler);
	return compiler;
};
..
```

可以看到，`options`被 `WebpackOptionsDefaulter`和`WebpackOptionsApply`处理过后直接给了`compiler`,看名字应该可以看懂，就是webpack的默认配置的意思，

lib/WebpackOptionsDefaulter.js：

```js
...
class WebpackOptionsDefaulter extends OptionsDefaulter {
	constructor() {
		super();
		this.set("entry", "./src"); //设置默认入口为./src
    this.set("context", process.cwd()); //设置context默认值为当前目录
		this.set("target", "web"); //设置target默认值为web
    ...
    	this.set("devtool", "make", options =>
			options.mode === "development" ? "eval" : false
		);
		}
}
...
```

lib/WebpackOptionsApply.js:

```js
...
class WebpackOptionsApply extends OptionsApply {
	constructor() {
		super();
	}

	/**
	 * @param {WebpackOptions} options options object
	 * @param {Compiler} compiler compiler object
	 * @returns {WebpackOptions} options object
	 */
	process(options, compiler) {
		compiler.outputPath = options.output.path;
		compiler.recordsInputPath = options.recordsInputPath || options.recordsPath;
		compiler.recordsOutputPath =
			options.recordsOutputPath || options.recordsPath;
		compiler.name = options.name;
		if (typeof options.target === "string") {
			switch (options.target) {
				case "web": {
					const JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
					const FetchCompileWasmPlugin = require("./web/FetchCompileWasmPlugin");
					const FetchCompileAsyncWasmPlugin = require("./web/FetchCompileAsyncWasmPlugin");
					const NodeSourcePlugin = require("./node/NodeSourcePlugin");
					new JsonpTemplatePlugin().apply(compiler);
					new FetchCompileWasmPlugin({
						mangleImports: options.optimization.mangleWasmImports
					}).apply(compiler);
					new FetchCompileAsyncWasmPlugin().apply(compiler);
					new NodeSourcePlugin(options.node).apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					break;
				}
         ...

```

可以看到，会根据配置信息加载默认的一些插件, 我们现在是在写demo，为了方便看懂源码我们直接把`mode`的值设置成`development`，

webpack.config.js:

```js
module.exports = {
    mode: "development"
};
```

### Entry and Context（入口文件和上下文）

webpack打包的入口文件配置。

#### context

string

基础目录，**绝对路径**，用于从配置中解析入口起点(entry point)和 loader

```js
context: path.resolve(__dirname, ".")
```

默认使用当前目录，但是推荐在配置中传递一个值。这使得你的配置独立于 CWD(current working directory - 当前执行路径)。

我们在上面默认配置的源码中有提到，

ib/WebpackOptionsDefaulter.js：

```js
...
class WebpackOptionsDefaulter extends OptionsDefaulter {
	constructor() {
		super();
		this.set("entry", "./src"); //设置默认入口为./src
    this.set("context", process.cwd()); //设置context默认值为当前目录
		this.set("target", "web"); //设置target默认值为web
  
		);
		}
}
...
```

建议我们设置一个当前根目录的路径，ok！ 我们修改一下我们的配置文件，然后把`context`的值设置为当前项目根目录：

webpack.config.js

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, ".")
};
```

👌，我们设置了一个当前项目根目录给context，然后我们运行一下webpack：

```js
➜  webpack-demo git:(master) ✗ npx webpack --mode development
Hash: 52512bca8884d07d6c74
Version: webpack 5.0.0-beta.7
Time: 39ms
Built at: 2020-07-07 15:31:37
  Asset      Size
main.js  77 bytes  [compared for emit]  [name: main]
Entrypoint main = main.js

ERROR in main
Module not found: Error: Can't resolve './src' in 'xxx/webpack/webpack-demo'

➜  webpack-demo git:(master) ✗ 

```

我们可以看到，当我们设置了当前目录给`context`的时候，webpack会去context目录去加载默认的入口文件"./src",我们把context直接指向src目录试试：

webpack.config.js

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src")
};
```

运行webpack：

```js
➜  webpack-demo git:(master) ✗ npx webpack --mode development
Hash: 0845667d00620459218b
Version: webpack 5.0.0-beta.7
Time: 43ms
Built at: 2020-07-07 15:34:46
  Asset      Size
main.js  77 bytes  [compared for emit]  [name: main]
Entrypoint main = main.js

ERROR in main
Module not found: Error: Can't resolve './src' in 'xxx/webpack/webpack-demo/src'

➜  webpack-demo git:(master) ✗ 

```

可以看到，webpack就会去"./src"目录中去找默认的入口文件"./src/src"。

#### entry

`string` `[string]` `object = {  string | [string] | object = { import string | [string], dependOn string | [string], filename string }}` `(function() => string | [string] | object = {  string | [string] } | object = { import string | [string], dependOn string | [string], filename string })`

起点或是应用程序的起点入口。从这个起点开始，应用程序启动执行。如果传递一个数组，那么数组的每一项都会执行。

动态加载的模块**不是**入口起点。

简单规则：每个 HTML 页面都有一个入口起点。单页应用(SPA)：一个入口起点，多页应用(MPA)：多个入口起点。

```js
entry: {
  home: "./home.js",
  about: "./about.js",
  contact: "./contact.js"
}
```

#### 命名

如果传入一个字符串或字符串数组，chunk 会被命名为 `main`。如果传入一个对象，则每个键(key)会是 chunk 的名称，该值描述了 chunk 的入口起点。

ok，我们在src下面创建一个index.js文件用来测试，

src/index.js:

```js
console.log("hello webpack");
```

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    entry: "./index.js"
};
```

我们直接使用了一个字符串来声明`entry`，然后执行webpack：

```js
➜  webpack-demo git:(master) ✗ npx webpack
Hash: 1435b4d06d79acb2f57c
Version: webpack 5.0.0-beta.7
Time: 55ms
Built at: 2020-07-07 15:40:49
  Asset       Size
main.js  289 bytes  [emitted]  [name: main]
Entrypoint main = main.js
./index 29 bytes [built]
➜  webpack-demo git:(master) ✗ 

```

Ok,这一次没有报错了，然后提示我们生成了一个“main.js"文件，

dist/main.js（webpack 编译过后的文件）：

```js
/******/ (() => { // webpackBootstrap
/*!***************!*\
  !*** ./index ***!
  \***************/
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements:  */
eval("console.log(\"hello webpack\");\n\n//# sourceURL=webpack:///./index?");
/******/ })()
;
```

可以看到，如果没有指定entry的key值的话，默认输出就是main.js。

#### 字符串

```js
entry: "./index.js"
```

这个我们上面已经测试过了。

#### 数组

```js
entry: ['./index.js']
```

之前我们研究过babel，如果我们需要手动的在入口文件中导入@babel/polyfill的话，可以用以下配置：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    entry: ["babel-polyfill","./index.js"]
};
```

我们下一个polyfill试试，然后执行webpack编译看结果：

```js
npm install -S babel-polyfill && npx webpack
```

dist/main.js:

```js
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/core-js/fn/regexp/escape.js":
/*!***************************************************!*\
  !*** ../node_modules/core-js/fn/regexp/escape.js ***!
  \***************************************************/
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: __webpack_require__, module */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("__webpack_require__(/*! ../../modules/core.regexp.escape */ \"../node_modules/core-js/modules/core.regexp.escape.js\");\nmodule.exports = __webpack_require__(/*! ../../modules/_core */ \"../node_modules/core-js/modules/_core.js\").RegExp.escape;\n\n\n//# sourceURL=webpack:///../node_modules/core-js/fn/regexp/escape.js?");

/***/ }),

/***/ "../node_modules/core-js/modules/_a-function.js":
/*!******************************************************!*\
  !*** ../node_modules/core-js/modules/_a-function.js ***!
  \******************************************************/
  ...
  eval("\n\n__webpack_require__(/*! core-js/shim */ \"../node_modules/core-js/shim.js\");\n\n__webpack_require__(/*! regenerator-runtime/runtime */ \"../node_modules/regenerator-runtime/runtime.js\");\n\n__webpack_require__(/*! core-js/fn/regexp/escape */ \"../node_modules/core-js/fn/regexp/escape.js\");\n\nif (__webpack_require__.g._babelPolyfill) {\n  throw new Error(\"only one instance of babel-polyfill is allowed\");\n}\n__webpack_require__.g._babelPolyfill = true;\n\nvar DEFINE_PROPERTY = \"defineProperty\";\nfunction define(O, key, value) {\n  O[key] || Object[DEFINE_PROPERTY](O, key, {\n    writable: true,\n    configurable: true,\n    value: value\n  });\n}\n\ndefine(String.prototype, \"padLeft\", \"\".padStart);\ndefine(String.prototype, \"padRight\", \"\".padEnd);\n\n\"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill\".split(\",\").forEach(function (key) {\n  [][key] && define(Array, key, Function.call.bind([][key]));\n});\n\n//# sourceURL=webpack:///../node_modules/babel-polyfill/lib/index.js?");
}();
!function() {
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements:  */
eval("console.log(\"hello webpack\");\n\n//# sourceURL=webpack:///./index.js?");
}();
/******/ })()
```

代码太多了，我就不全部展示了，可以看到，把babel-polyfill的代码直接包含进来了。

#### 对象

我们可以使用一个对象去描述入口文件

```js
module.exports = {
  //...
  entry: {
    home: './home.js',
    shared: ['react', 'react-dom', 'redux', 'react-redux'], //共享的entry配置
    catalog: {
      import: './catalog.js',
      filename: 'pages/catalog.js',
      dependOn:'shared' //可以依赖某个entry
    },
    personal: {
      import: './personal.js',
      filename: 'pages/personal.js',
      dependOn:'shared'
    }
  }
};
```

比如我们需要引入babel-polyfill，也可以改成以下配置：

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        shared: ["babel-polyfill"],
        mainStr: "./index.js",
        mainArray: ["./index.js"],
        main: {
            import: "./index.js",
            dependOn: "shared",
            filename: 'pages/main_polyfill.js',
        }
    }
};
```

很尴尬😂，我当前源码的版本没有这样的功能，估计webpack5.0发布完后会有的，

Xxx/webpack-src/lib/EntryOptionPlugin.js:

```js
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const DynamicEntryPlugin = require("./DynamicEntryPlugin");
const EntryPlugin = require("./EntryPlugin");

/** @typedef {import("../declarations/WebpackOptions").EntryItem} EntryItem */
/** @typedef {import("./Compiler")} Compiler */

module.exports = class EntryOptionPlugin {
	/**
	 * @param {Compiler} compiler the compiler instance one is tapping into
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
			/**
			 * @param {EntryItem} entry entry array or single path
			 * @param {string} name entry key name
			 * @returns {void}
			 */
			const applyEntryPlugins = (entry, name) => {
				if (typeof entry === "string") {
					new EntryPlugin(context, entry, name).apply(compiler);
				} else if (Array.isArray(entry)) {
					for (const item of entry) {
						applyEntryPlugins(item, name);
					}
				}
			};

			if (typeof entry === "string" || Array.isArray(entry)) {
				applyEntryPlugins(entry, "main");
			} else if (typeof entry === "object") {
				for (const name of Object.keys(entry)) {
					applyEntryPlugins(entry[name], name);
				}
			} else if (typeof entry === "function") {
				new DynamicEntryPlugin(context, entry).apply(compiler);
			}
			return true;
		});
	}
};

```

可以看到当前版本的webpack5.0.0-beta.7(我们这里用webpack5.0.0-beta.7分析是因为前面一篇文章的源码分析用的是这个版本)是不支持这种配置的，但是在最新的webpack5.0.0.-beta.21中是有的：

x x x/webpack-src/lib/EntryOptionPlugin.js（webpack5.0.0-beta.21）

```js
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const DynamicEntryPlugin = require("./DynamicEntryPlugin");
const EntryPlugin = require("./EntryPlugin");

/** @typedef {import("../declarations/WebpackOptions").EntryItem} EntryItem */
/** @typedef {import("./Compiler")} Compiler */

module.exports = class EntryOptionPlugin {
	/**
	 * @param {Compiler} compiler the compiler instance one is tapping into
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.entryOption.tap("EntryOptionPlugin", (context, entry) => {
			/**
			 * @param {EntryItem} entry entry array or single path
			 * @param {string} name entry key name
			 * @returns {void}
			 */
			const applyEntryPlugins = (entry, name) => {
				if (typeof entry === "string") {
					new EntryPlugin(context, entry, name).apply(compiler);
				} else if (Array.isArray(entry)) {
					for (const item of entry) {
						applyEntryPlugins(item, name);
					}
				}
			};

			if (typeof entry === "string" || Array.isArray(entry)) {
				applyEntryPlugins(entry, "main");
			} else if (typeof entry === "object") {
				for (const name of Object.keys(entry)) {
					applyEntryPlugins(entry[name], name);
				}
			} else if (typeof entry === "function") {
				new DynamicEntryPlugin(context, entry).apply(compiler);
			}
			return true;
		});
	}
};

```

ok，那么当前版本的webpack中怎么配置对象类型的入口呢？

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: "./index.js"
    }
};
```

#### 动态入口

```js
module.exports = {
  //...
  entry: () => './demo'
};
```

或者

```js
module.exports = {
  //...
  entry: () => new Promise((resolve) => resolve(['./demo', './demo2']))
};
For exa
```

可以看到，甚至可以配置一个方法返回一个Promise对象方式，那么我们可以做什么呢？ 比如我们webpack挂载在远程服务器，需要根据特殊的指定打包特定的入口，我们就可以配置一个异步的入口。

### 输出(output)

#### path

`string:`默认为`path.join(process.cwd(), "dist") `

output 目录对应一个**绝对路径**。

```js
path: path.resolve(__dirname, 'dist')
```

注意，`[hash]` 在参数中被替换为编译过程(compilation)的 hash。详细信息请查看[指南 - 缓存](https://www.webpackjs.com/guides/caching)。

对应源码位置：

lib/WebpackOptionsDefaulter.js

```js
...
	this.set("output.path", path.join(process.cwd(), "dist"));
...
```

我们改一下打包后输出的位置为“lib”目录：

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: "./index.js"
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
    }
};
```

运行打包后文件被放在了lib目录：

lib/app.js

```js
/******/ (() => { // webpackBootstrap
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements:  */
eval("console.log(\"hello webpack\");\n\n//# sourceURL=webpack:///./index.js?");
/******/ })()
;
```

#### pathinfo

```
boolean
```

告诉 webpack 在 bundle 中引入「所包含模块信息」的相关注释。此选项默认值是 `false`，并且**不应该**用于生产环境(production)，但是对阅读开发环境(development)中的生成代码(generated code)极其有用。

```js
pathinfo: true
```

注意，这些注释也会被添加至经过 tree shaking 后生成的 bundle 中。

源码位置：

lib/WebpackOptionsDefaulter.js

可以看到，当mode为“development”的时候是开启的状态，打包完毕后会把模块的依赖信息打印出来，比如上面打包过后的lib/app.js文件中的注释：

```js
/******/ (() => { // webpackBootstrap
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements:  */
eval("console.log(\"hello webpack\");\n\n//# sourceURL=webpack:///./index.js?");
/******/ })()
;
```

我们关掉之后再来测试一下：

webpack.config.js

```js
const path = require("path");
module.exports = {
    mode: "production",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: "./index.js"
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: false
    }
};
```

lib/app.js:

```js
/******/ (() => { // webpackBootstrap
eval("console.log(\"hello webpack\");\n\n//# sourceURL=webpack:///./index.js?");
/******/ })()
;
```

可以看到，少了模块说明的注释信息。

开发环境记得关闭哦！（webpack默认在生产模式的时候是关闭的，如果开启的话webpack会利用terser-webpack-plugin插件创建lisence信息）

比如：

webpack.config.js

```js
const path = require("path");
module.exports = {
    mode: "production",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: "./index.js"
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true
    }
};
```

打包过后会在lib下面生成两个文件，

app.js.LICENSE：

```js
/*!******************!*\
  !*** ./index.js ***!
  \******************/

/*! exports [maybe provided (runtime-defined)] [unused] */

/*! runtime requirements:  */

/*! ModuleConcatenation bailout: Module is not an ECMAScript module */

```

app.js:

```js
/*! For license information please see app.js.LICENSE */
console.log("hello webpack");
```

pathinfo更多用法大家可以自己去看源码哦。

### publichPath

