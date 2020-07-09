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

#### publichPath

`string = ''` `function`

对于按需加载(on-demand-load)或加载外部资源(external resources)（如图片、文件等）来说，output.publicPath 是很重要的选项。如果指定了一个错误的值，则在加载这些资源时会收到 404 错误。

此选项指定在浏览器中所引用的「此输出目录对应的**公开 URL**」。相对 URL(relative URL) 会被相对于 HTML 页面（或 `` 标签）解析。相对于服务的 URL(Server-relative URL)，相对于协议的 URL(protocol-relative URL) 或绝对 URL(absolute URL) 也可是可能用到的，或者有时必须用到，例如：当将资源托管到 CDN 时。

该选项的值是以 runtime(运行时) 或 loader(载入时) 所创建的每个 URL 为前缀。因此，在多数情况下，**此选项的值都会以`/`结束**。

默认值是一个空字符串 `""`。

我们写一个异步chunk，首先我们在src目录底下创建一个demo-publicpath.js文件：

src/demo-publicpath.js

```js
export function say() {
    document.body.append(document.createTextNode("hello webpack"))
}
```

代码很简单，就是导出一个方法，然后在body中拼了一个文本节点。

在index.js中引用demo-publicpath.js模块的say方法，

src/index.js:

```js
import("./demo-publicpath").then((demoPublicPath) => {
    demoPublicPath.say();
});
```

ok，可以看到，我们用了es的一个动态导入，然后webpack判断是import动态导入会采用jsonp的形式加载对应的模块。

看一下配置文件，

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
        pathinfo: true,
    }
};
```

打包编译：

```js
192:webpack-demo yinqingyang$ npx webpack
Hash: 1f5ccbb68967d389dee1
Version: webpack 5.0.0-beta.9
Time: 132ms
Built at: 2020-07-07 20:48:31
                Asset       Size
               app.js   8.97 KiB  [compared for emit]  [name: app]
demo-publicpath_js.js  952 bytes  [emitted]
Entrypoint app = app.js
./index.js 84 bytes [built]
./demo-publicpath.js 92 bytes [built]
    + 7 hidden modules
192:webpack-demo yinqingyang$ 

```

可以看到，打包过后生成了两个文件，

lib/app.js:

```js
/******/ (() => { // webpackBootstrap
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
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "./lib/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// Promise = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"app": 0
/******/ 		};
/******/ 		
/******/ 		
/******/ 		
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => {
/******/ 								installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 							});
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							var loadingEnded = () => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) return installedChunkData[1];
/******/ 								}
/******/ 							};
/******/ 							var script = document.createElement('script');
/******/ 							var onScriptComplete;
/******/ 		
/******/ 							script.charset = 'utf-8';
/******/ 							script.timeout = 120;
/******/ 							if (__webpack_require__.nc) {
/******/ 								script.setAttribute("nonce", __webpack_require__.nc);
/******/ 							}
/******/ 							script.src = url;
/******/ 		
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							onScriptComplete = (event) => {
/******/ 								onScriptComplete = () => {
/******/ 		
/******/ 								}
/******/ 								// avoid mem leaks in IE.
/******/ 								script.onerror = script.onload = null;
/******/ 								clearTimeout(timeout);
/******/ 								var reportError = loadingEnded();
/******/ 								if(reportError) {
/******/ 									var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 									var realSrc = event && event.target && event.target.src;
/******/ 									error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 									error.name = 'ChunkLoadError';
/******/ 									error.type = errorType;
/******/ 									error.request = realSrc;
/******/ 									reportError(error);
/******/ 								}
/******/ 							}
/******/ 							;
/******/ 							var timeout = setTimeout(() => {
/******/ 								onScriptComplete({ type: 'timeout', target: script })
/******/ 							}, 120000);
/******/ 							script.onerror = script.onload = onScriptComplete;
/******/ 							document.head.appendChild(script);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 		
/******/ 						// no HMR
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				// no chunk preloading needed
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no deferred startup or startup prefetching
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		function webpackJsonpCallback(data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 		
/******/ 			var runtime = data[3];
/******/ 		
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0, resolves = [];
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					resolves.push(installedChunks[chunkId][0]);
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			if(parentJsonpFunction) parentJsonpFunction(data);
/******/ 		
/******/ 			while(resolves.length) {
/******/ 				resolves.shift()();
/******/ 			}
/******/ 		
/******/ 		};
/******/ 		
/******/ 		var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 		var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 		jsonpArray.push = webpackJsonpCallback;
/******/ 		
/******/ 		var parentJsonpFunction = oldJsonpFunction;
/******/ 	})();
/******/ 	
/************************************************************************/
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! unknown exports (runtime-defined) */
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: __webpack_require__.e, __webpack_require__, __webpack_require__.* */
eval("__webpack_require__.e(/*! import() */ \"demo-publicpath_js\").then(__webpack_require__.bind(__webpack_require__, /*! ./demo-publicpath */ \"./demo-publicpath.js\")).then((demoPublicPath) => {\n    demoPublicPath.say();\n});\n\n//# sourceURL=webpack:///./index.js?");
/******/ })()
;
```

lib/demo-publicpath_js.js:

```js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["demo-publicpath_js"],{

/***/ "./demo-publicpath.js":
/*!****************************!*\
  !*** ./demo-publicpath.js ***!
  \****************************/
/*! namespace exports */
/*! export say [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__.d, __webpack_require__.r, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"say\": () => /* binding */ say\n/* harmony export */ });\nfunction say() {\n    document.body.append(document.createTextNode(\"hello webpack\"))\n}\n\n//# sourceURL=webpack:///./demo-publicpath.js?");

/***/ })

}]);
```

然后我们在根目录创建一个test.html文件用来测试，

test.html：

```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<script src="./lib/app.js"></script>
</body>
</html>
```

我们到浏览器运行一下test.html，打开浏览器会发现报错信息：

```markdown
app.js:160 GET http://localhost:8080/webpack-demo/demo-publicpath_js.js 404 (Not Found)
__webpack_require__.f.j @ app.js:160
(anonymous) @ app.js:50
__webpack_require__.e @ app.js:49
eval @ index.js:1
(anonymous) @ app.js:223
(anonymous) @ app.js:224
app.js:136 Uncaught (in promise) ChunkLoadError: Loading chunk demo-publicpath_js failed.
(error: http://localhost:8080/webpack-demo/demo-publicpath_js.js)
    at Object.__webpack_require__.f.j (http://localhost:8080/webpack-demo/lib/app.js:136:29)
    at http://localhost:8080/webpack-demo/lib/app.js:50:40
    at Array.reduce (<anonymous>)
    at Function.__webpack_require__.e (http://localhost:8080/webpack-demo/lib/app.js:49:67)
    at eval (webpack:///./index.js?:1:21)
    at http://localhost:8080/webpack-demo/lib/app.js:223:1
    at http://localhost:8080/webpack-demo/lib/app.js:224:12
__webpack_require__.f.j @ app.js:136
(anonymous) @ app.js:50
__webpack_require__.e @ app.js:49
eval @ index.js:1
(anonymous) @ app.js:223
(anonymous) @ app.js:224
Promise.then (async)
eval @ index.js:1
(anonymous) @ app.js:223
(anonymous) @ app.js:22
```

可以看到，默认去加载http://localhost:8080/webpack-demo/demo-publicpath_js.js文件，但是我们需要加载的是http://localhost:8080/webpack-demo/lib/demo-publicpath_js.js,少了个“lib”目录，所以我们修改一下publicPath让它默认加上lib目录，

webpack.config.js:

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
        pathinfo: true,
        publicPath: "./lib/"
    }
};
```

然后我们继续打包运行：

![pub1](/Users/yinqingyang/前端架构系列之(webpack)/webpack-demo/pub1.png)

可以看到，代码正常运行并且页面显示了预期结果。

webpack在处理异步chunk的时候会动态的创建一个script标签，在上面打包完毕的app.js我们可以看到这么一段代码，

lib/app.js:

```js
var script = document.createElement('script');
/******/ 							var onScriptComplete;
/******/ 		
/******/ 							script.charset = 'utf-8';
/******/ 							script.timeout = 120;
/******/ 							if (__webpack_require__.nc) {
/******/ 								script.setAttribute("nonce", __webpack_require__.nc);
/******/ 							}
/******/ 							script.src = url;
/******/ 		
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							onScriptComplete = (event) => {
/******/ 								onScriptComplete = () => {
/******/ 		
/******/ 								}
/******/ 								// avoid mem leaks in IE.
/******/ 								script.onerror = script.onload = null;
/******/ 								clearTimeout(timeout);
/******/ 								var reportError = loadingEnded();
/******/ 								if(reportError) {
/******/ 									var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 									var realSrc = event && event.target && event.target.src;
/******/ 									error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 									error.name = 'ChunkLoadError';
/******/ 									error.type = errorType;
/******/ 									error.request = realSrc;
/******/ 									reportError(error);
/******/ 								}
/******/ 							}
/******/ 							;
/******/ 							var timeout = setTimeout(() => {
/******/ 								onScriptComplete({ type: 'timeout', target: script })
/******/ 							}, 120000);
/******/ 							script.onerror = script.onload = onScriptComplete;
/******/ 							document.head.appendChild(script);
```

也就是动态创建了一个script标签用来异步加载demo-publicpath_js.js文件，但是scirpt标签的src是啥呢？

```js
url=publicPath+chunkPath;
```

因为`publicPath`默认为空字符串，所以转成script标签就为：

```html
<script src="demo-publicpath_js.js"></script>
```

这样是加载不到我们的demo-publicpath_js.js文件的，因为我们默认打包到lib目录了。

所以当我们修改了`publicPath`为`./lib/`后，转成script标签就为：

```html
<script src="./lib/demo-publicpath_js.js"></script>
```

这样就能正常加载到了。

当然，`publicPath`也可以为一个完整的cdn域名地址，比如：“http://localhost:8080/webpack-demo/lib/”，转成script标签就为：

```html
<script src="http://localhost:8080/webpack-demo/lib/demo-publicpath_js.js"></script>
```

在编译时(compile time)无法知道输出文件的 `publicPath` 的情况下，可以留空，然后在入口文件(entry file)处使用[自由变量(free variable)](https://stackoverflow.com/questions/12934929/what-are-free-variables) `__webpack_public_path__`，以便在运行时(runtime)进行动态设置。

比如，我们去掉配置文件的publicPath配置，

webpack.config.js:

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
        pathinfo: true,
    }
};
```

然后在入口文件index.js中添加以下代码，

src/index.js:

```js
__webpack_public_path__ = "http://localhost:8080/webpack-demo/lib/";
import("./demo-publicpath").then((demoPublicPath) => {
    demoPublicPath.say();
});
```

我们编译打包然后运行test.html文件，会发现也是一样的结果，效果我就不截图演示了。

#### filename

`string` `function (pathData, assetInfo) => string`

此选项决定了每个输出 bundle 的名称。这些 bundle 将写入到 [`output.path`](https://www.webpackjs.com/configuration/output/#output-path) 选项指定的目录下。

默认为`[name].js`，`[name]`代表的就是chunk的名称，除了`name`外filename可选参数还可以为:

以下就是所有的可选参数 (主要由webpack的[TemplatedPathPlugin`](https://github.com/webpack/webpack/blob/master/lib/TemplatedPathPlugin.js)插件实现):

| Template           | Description                                                  |
| :----------------- | :----------------------------------------------------------- |
| [hash]             | 模块唯一标识符的hash值                                       |
| [contenthash?:len] | the hash of the content of a file, which is different for each asset |
| [chunkhash?:len]   | The hash of the chunk content                                |
| [name]             | The module name                                              |
| [id]               | The module identifier                                        |
| [query]            | 跟在文件名“？”符号后面的字符串                               |
| [function]         | The function, which can return filename [ string ]           |

源码地址：lib/TemplatedPathPlugin.js

我们修改一些配置文件，

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
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js"
    }
};
```

然后我们编译运行后会发现lib目录生成了两个文件:

```diff
app.d61bd5c5dcae317f.83aff0fe69484673.app.js
demo-publicpath_js.d29ed06019743d38.83aff0fe69484673.demo-publicpath_js.js
```

那为什么`id`跟`name`是一样的值呢？ 因为我们使用的`mode`是“development”，webpack默认对id使用的是NamedModuleIdsPlugin插件（直接使用module的名称代替id），如果`mode`使用的是"production"的话webpack就会用HashedModuleIdsPlugin插件处理id，我们直接修改配置文件把`mode`改成“production”，

webpack.config.js：

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
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
    }
};
```

然后我们编译运行后会发现lib目录生成了四个文件:

```
721.47800a7d336db006.4eae5adf4c890bf1.721.js
721.47800a7d336db006.4eae5adf4c890bf1.721.js.LICENSE
app.c0c0395ab8956721.4eae5adf4c890bf1.143.js
app.c0c0395ab8956721.4eae5adf4c890bf1.143.js.LICENSE
```

可以看到，入口文件打包后是预期效果了，但是chunk的name跟id还是相同的，还是webpack默认配置的问题，当使用production的时候，为了防止chunk名称重复就直接把name换成了id。

#### chunkFilename

`string = '[id].js'`

刚已经介绍过filename字段，filename会作用于chunk文件跟入口文件，如果需要单独设置chunk文件的名称的话，就可以使用chunkFilename字段，用法跟filename一样，

webpack.config.js：

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
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js" //默认配置
    }
};
```

打包后lib目录底下会有四个文件：

```
721.js
721.js.LICENSE
app.791277018b73acf2.1e4e0e1ed02ab7b6.143.js
app.791277018b73acf2.1e4e0e1ed02ab7b6.143.js.LICENSE
```

#### assetModuleFilename

跟 [`output.filename`](https://webpack.js.org/configuration/output/#outputfilename) 一样，但是是关于 [Asset Modules](https://webpack.js.org/guides/asset-modules/)的内容， [Asset Modules](https://webpack.js.org/guides/asset-modules/)就是我们在webpack处理文件模块，处理完的结果会放入到output.path目录，然后名称配置就是assetModuleFilename选项，比如可以设置为以下配置：

```js
assetModuleFilename: 'images/[hash][ext]'
```

每一个loader都会有自己单独的assetModuleFilename配置，如果没有就会用config的assetModuleFilename字段，默认为：

```js
assetModuleFilename: '[hash][ext]'
```

#### library

`string` `object`

> `string` 或 `object`（从 webpack 3.1.0 开始；用于 `libraryTarget: "umd"`）

`output.library` 的值的作用，取决于[`output.libraryTarget`](https://www.webpackjs.com/configuration/output/#output-librarytarget) 选项的值；完整的详细信息请查阅该章节。注意，`output.libraryTarget` 的默认选项是 `var`，所以如果使用以下配置选项：

```js
output: {
  library: "MyLibrary"
}
```

如果生成的输出文件，是在 HTML 页面中作为一个 script 标签引入，则变量 `MyLibrary` 将与入口文件的返回值绑定。

看官网的解释有点抽象，我们结合demo来分析，首先我们修改一下我们的配置文件，

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
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        library: "demoSay",
    }
};
```

我们指定了`library: "demoSay",`然后我们执行编译看结果，

lib/app.07ddaf5704298aa1.67ea617b36eb3365.app.js：

```js
var demoSay =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({
  ....

```

代码有点多，我们直接运行test.html文件，

test.html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<script src="./lib/app.07ddaf5704298aa1.67ea617b36eb3365.app.js"></script>
</body>
</html>
```

然后我们在浏览器调试窗打印一下demoSay：

```js
demoSay
{}
```

可以看到，demoSay返回了一个空对象，是的！ 我们打开我们的入口文件index.js看看，

src/index.js:

```js
__webpack_public_path__ = "http://localhost:8080/webpack-demo/lib/";
import("./demo-publicpath").then((demoPublicPath) => {
    demoPublicPath.say();
});
```

我们直接执行了代码，并没有任何导出的内容，所以我们拿到的demoSay是一个空对象。

我们修改一下index.js入口文件，让它默认导出一个demoSay方法，

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
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        library: "demoSay",
        libraryExport: "default",
    }
};
```

src/index.js:

```js
__webpack_public_path__ = "http://localhost:8080/webpack-demo/lib/";
export default function demoSay() {
    import("./demo-publicpath").then((demoPublicPath) => {
        demoPublicPath.say();
    });
}
```

打包编译后lib目录下面文件：

```
app.054433abb6526c08.97d75e7a53c562f4.app.js
demo-publicpath_js.js
```

修改test.html：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<script src="./lib/app.054433abb6526c08.97d75e7a53c562f4.app.js"></script>
</body>
</html>
```

运行test.html文件，然后打印并运行demoSay变量：

```js
demoSay
ƒ demoSay() {
    __webpack_require__.e(/*! import() */ "demo-publicpath_js").then(__webpack_require__.bind(__webpack_require__, /*! ./demo-publicpath */ "./demo-publicpath.js")).then((demoPublicPath) …
demoSay();
undefined
```

可以看到,这一次demoSay直接变成了我们入口文件中输出的demoSay方法，然后直接调用后页面上出现了“hello webpack”。

#### libraryExport

`string default to ""`

细心的小伙伴已经发现了，我们在上面的demo中还加入了一个叫libraryExport的字段，然后我们给了一个“default”，也就是告诉webpack，默认导出对应模块的default变量。

比如我们入口文件,

src/index.js:

```js
__webpack_public_path__ = "http://localhost:8080/webpack-demo/lib/";
export default function demoSay() {
    import("./demo-publicpath").then((demoPublicPath) => {
        demoPublicPath.say();
    });
}
```

我们默认导出模块的default变量，在这里也就是我们的demoSay方法，所以我们在运行的时候可以直接调用demoSay方法。

#### libraryTarget

`string  默认值： `"var"

webpack5.0中可以为：`"var" | "module" | "assign" | "this" | "window" | "self" | "global" | "commonjs" | "commonjs2" | "commonjs-module" | "amd" | "amd-require" | "umd" | "umd2" | "jsonp" | "system"`

配置如何暴露 library。可以使用下面的选项中的任意一个。注意，此选项与分配给 [`output.library`](https://www.webpackjs.com/configuration/output/#output-library) 的值一同使用。

上面我们已经演示过`var`了，也就是在全局暴露一个变量，然后变量名为library的配置值，

##### module

这个是webpack5特有的一个属性，需要跟另外一个叫[experiments](https://webpack.js.org/configuration/experiments/#experiments)属性的一起用，experiments就是还在实验中的一些特性（不建议开启[experiments](https://webpack.js.org/configuration/experiments/#experiments)的更多用法可以参考官网）。

我们修改一下配置文件，webpack.config.js:

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
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        // library: "demoSay",
        // libraryExport: "default",
        libraryTarget: "module",

    },
    experiments: {
        outputModule: true
    }
};
```

我们把`libraryTarget`设置为了“module”，然后把`experiments.outputModule`设置为了“true”，然后我们执行打包命令看一下lib目录：

app.4d52f6f40fbe4016.28aa8b97dd0f050f.app.js：

```js
/******/ "use strict";
/******/ var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! export default [provided] [used] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usag
...
```

demo-publicpath_js.js:

```js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["demo-publicpath_js"],{

/***/ "./demo-publicpath.js":
/*!****************************!*\
  !*** ./demo-publicpath.js ***!
  \****************************/
/*! export say [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__.d, __webpack_require__.r, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"say\": () => /* binding */ say\n/* harmony export */ });\nfunction say() {\n    document.body.append(document.createTextNode(\"hello webpack\"))\n}\n\n//# sourceURL=webpack:///./demo-publicpath.js?");

/***/ })

}]); 
```

那我们怎么用呢？

我们修改一下我们的test.html文件：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<script src="./lib/app.c332dfffe553ed52.a7f098bb4c793dee.app.js"></script>
<script>
    var demoSay = __webpack_require__("./index.js").default;
    demoSay();
</script>
</body>
</html>
```

```js
 var demoSay = __webpack_require__("./index.js").default;
```

就可以拿到demoSay方法了，然后调用demoSay方法就会在页面上看到“hello webpack”了。

##### assign

直接在全局环境中暴露一个未申明的变量“demoSay”，js中可以当全局变量访问，所以是可以直接执行的：

```js
demoSay()
```

##### this

直接在this上面绑定一个变量“demoSay”,浏览器中this代表window的意思，所以我们也是可以在全局环境中访问demoSay方法。

```js
this["demoSay"] =xxx
```

`window`、`self`、`global`都是一样的操作，在浏览器环境中都代表window，我们也是可以在全局环境中访问demoSay方法。

##### jsonp

通过jsonp的形式来导出当前模块，我们修改一下配置文件，把libraryTarget改成“jsonp”,

webpack.config.js:

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
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        library: "demoSay",
        libraryExport: "default",
        libraryTarget: "jsonp",

    },
    experiments: {
        // outputModule: true
    }
};
```

然后我们打包后在html中引入打包完毕的js文件，最后window对象上面注册一个demoSay方法用来作为jsonp的回调函数，

test.html：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<script>
    function demoSay(module) {
        module();
    }
</script>
<script src="./lib/app.f366a0d04be496a3.312b7fd4a12f5d79.app.js"></script>
</body>
</html>
```

ok～ 运行是可以正常显示的，我就不截图了，小伙伴自己一定要去跑跑代码哦。

#### 其它配置

output的其它一些配置大家可以自己去参考官网跑一下demo（不过我们基本项目中也用不到），这里就不分析了。

### Module

这些选项决定了如何处理项目中的[不同类型的模块](https://www.webpackjs.com/concepts/modules)。

#### rules

`array`

创建模块时，匹配请求的[规则](https://www.webpackjs.com/configuration/module/#rule)数组。这些规则能够修改模块的创建方式。这些规则能够对模块(module)应用 loader，或者修改解析器(parser)。

##### noParse

`regExp | [RegExp]`

`RegExp | [RegExp] | function`（从 webpack 3.0.0 开始）

防止 webpack 解析那些任何与给定正则表达式相匹配的文件。忽略的文件中**不应该含有** `import`, `require`, `define` 的调用，或任何其他导入机制。忽略大型的 library 可以提高构建性能。

```js
noParse: /jquery|lodash/

// 从 webpack 3.0.0 开始
noParse: function(content) {
  return /jquery|lodash/.test(content);
}
```

怎么理解呢？比如我们demo中前面讲entry的时候，我们导入了一个叫“babel-polyfill”的babel垫片，其实我们当成module导入的时候，webpack会去分析babel-polyfill的模块依赖，是会影响编译速度的，所以我们改一下配置文件，让它默认不去解析babel-polyfill，

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: ["babel-polyfill","./index.js"]
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        library: "demoSay",
        libraryExport: "default",
        libraryTarget: "jsonp",

    },
    experiments: {
        // outputModule: true
    },
    module: {
        noParse: /babel-polyfill/
    }
};
```

然后我们编译运行webpack看结果，

Lib/app.c2906c554fe563aa.9660e03dcc700539.app.js:

```js
demoSay(/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/babel-polyfill/lib/index.js":
/*!***************************************************!*\
  !*** ../node_modules/babel-polyfill/lib/index.js ***!
  \***************************************************/
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: module, __webpack_exports__, top-level-this-exports */
/***/ (function(module, exports) {

eval("\"use strict\";\n\nrequire(\"core-js/shim\");\n\nrequire(\"regenerator-runtime/runtime\");\n\nrequire(\"core-js/fn/regexp/escape\");\n\nif (global._babelPolyfill) {\n  throw new Error(\"only one instance of babel-polyfill is allowed\");\n}\nglobal._babelPolyfill = true;\n\nvar DEFINE_PROPERTY = \"defineProperty\";\nfunction define(O, key, value) {\n  O[key] || Object[DEFINE_PROPERTY](O, key, {\n    writable: true,\n    configurable: true,\n    value: value\n  });\n}\n\ndefine(String.prototype, \"padLeft\", \"\".padStart);\ndefine(String.prototype, \"padRight\", \"\".padEnd);\n\n\"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill\".split(\",\").forEach(function (key) {\n  [][key] && define(Array, key, Function.call.bind([][key]));\n});\n\n//# sourceURL=webpack://demoSay/../node_modules/babel-polyfill/lib/index.js?");
..
```

可以看到，webpack设置了noParse后就不会再去分析babel-polifill的模块依赖，直接把babel-polyfill/lib/index.js中的源文件给导入进来了，

node_modules/babel-polyfill/lib/index.js:

```js
"use strict";

require("core-js/shim");

require("regenerator-runtime/runtime");

require("core-js/fn/regexp/escape");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel-polyfill is allowed");
}
global._babelPolyfill = true;

var DEFINE_PROPERTY = "defineProperty";
function define(O, key, value) {
  O[key] || Object[DEFINE_PROPERTY](O, key, {
    writable: true,
    configurable: true,
    value: value
  });
}

define(String.prototype, "padLeft", "".padStart);
define(String.prototype, "padRight", "".padEnd);

"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
  [][key] && define(Array, key, Function.call.bind([][key]));
});
```

这样在浏览器直接运行肯定是不行的，运行test.html:

```js
Navigated to http://localhost:8091/webpack-demo/test.html?_ijt=953ti63cuqmunn4c0eih81htnn
index.js:3 Uncaught ReferenceError: require is not defined
    at eval (index.js:3)
    at Object.../node_modules/babel-polyfill/lib/index.js (app.c2906c554fe563aa.9660e03dcc700539.app.js:12)
    at __webpack_require__ (app.c2906c554fe563aa.9660e03dcc700539.app.js:49)
    at app.c2906c554fe563aa.9660e03dcc700539.app.js:244
    at app.c2906c554fe563aa.9660e03dcc700539.app.js:246
eval @ index.js:3
../node_modules/babel-polyfill/lib/index.js @ app.c2906c554fe563aa.9660e03dcc700539.app.js:12
__webpack_require__ @ app.c2906c554fe563aa.9660e03dcc700539.app.js:49
(anonymous) @ app.c2906c554fe563aa.9660e03dcc700539.app.js:244
(anonymous) @ app.c2906c554fe563aa.9660e03dcc700539.app.js:246
```

可以看到，直接报错了，因为我们导入的是babel-polyfill未打包完成的入口，我们改成打包好的依赖，

webpack.config.js：

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    // entry: ["babel-polyfill","./index.js"]
    entry: {
        app: ["babel-polyfill/dist/polyfill.min.js","./index.js"]
    },
    output: {
        path: path.join(process.cwd(), "lib"), //默认为path.join(process.cwd(), "dist")
        pathinfo: true,
        filename: "[name].[contenthash:16].[fullhash:16].[id].js",
        chunkFilename: "[id].js",
        library: "demoSay",
        libraryExport: "default",
        libraryTarget: "jsonp",

    },
    experiments: {
        // outputModule: true
    },
    module: {
        noParse: /babel-polyfill/
    }
};
```

再次打包运行看结果，

lib/app.9e96cc5a4f61983c.e21638e08b6f3396.app.js:

```js
demoSay(/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/babel-polyfill/dist/polyfill.min.js":
/*!***********************************************************!*\
  !*** ../node_modules/babel-polyfill/dist/polyfill.min.js ***!
  \***********************************************************/
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: module, __webpack_exports__, top-level-this-exports */
/***/ (function(module, exports) {

eval("!function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var c=\"function\"==typeof require&&require;if(!u&&c)return c(o,!0);if(i)return i(o,!0);var a=new Error(\"Cannot find module '\"+o+\"'\");throw a.code=\"MODULE_NOT_FOUND\",a}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(n){var r=t[o][1][n];return s(r||n)},f,f.exports,e,t,n,r)}return n[o].exports}for(var i=\"function\"==typeof require&&require,o=0;o<r.length;o++)s(r[o]);return s}({1:[function(t,n,r){(function(n){\"use strict\";function define(t,n,e){t[n]||Object[r](t,n,{writable:!0,configurable:!0,value:e})}if(t(327),t(328),t(2),n._babelPolyfill)throw new Error(\"only one instance of babel-polyfill is allowed\");n._babelPolyfill=!0;var r=\"defineProperty\";define(String.prototype,\"padLeft\",\"\".padStart),define(String.prototype,\"padRight\",\"\".padEnd),\"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill\".split(\",\").forEach(function(t){[][t]&&define(Array,t,Function.call.bind([][t]))})}).call(this,\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:\"undefined\"!=typeof window?window:{})},{2:2,327:327,328:328}],2:[function(t,n,r){t(130),n.exports=t(23).RegExp.escape},{130:130,23:23}],3:[function(t,n,r){n.exports=function(t){if(\"function\"!=typeof t)throw TypeError(t+\" is not a function!\");return t}},{}],4:[function(t,n,r){var e=t(18);n.exports=function(t,n){if(\"number\"!=typeof t&&\"Number\"!=e(t))throw TypeError(n);return+t}},{18:18}],5:[function(t,n,r){var e=t(128)(\"unscopables\"),i=Array.prototype;void 0==i[e]&&t(42)(i,e,{}),n.exports=function(t){i[e][t]=!0}},{128:128,42:42}],6:[function(t,n,r){n.exports=function(t,n,r,e){if(!(t instanceof n)||void 0!==e&&e in t)throw TypeError(r+\": incorrect invocation!\");return t}},{}],7:[function(t,n,r){var e=t(51);n.exports=function(t){if(!e(t))throw TypeError(t+\" is not an object!\");return t}},{51:51}],8:[function(t,n,r){\"use strict\";var e=t(119),i=t(114),o=t(118);n.exports=[].copyWithin||function copyWithin(t,n){var r=e(this),u=o(r.length),c=i(t,u),a=i(n,u),f=arguments.length>2?arguments[2]:void 0,s=Math.min((void 0===f?u:i(f,u))-a,u-c),l=1;for(a<c&&c<a+s&&(l=-1,a+=s-1,c+=s-1);s-- >0;)
     ...
```

可以看到，直接把babel-polyfill打包好的源码给导入进来了，这次我们就可以在浏览器中正常运行test.html文件了。

##### Rule

每个规则可以分为三部分 - 条件(condition)，结果(result)和嵌套规则(nested rule)。

###### Rule 条件

条件有两种输入值：

1. resource：请求文件的绝对路径。它已经根据 [`resolve` 规则](https://www.webpackjs.com/configuration/resolve)解析。
2. issuer: 被请求资源(requested the resource)的模块文件的绝对路径。是导入时的位置。

**例如:** 从 `app.js` `导入 './style.css'`，resource 是 `/path/to/style.css`. issuer 是 `/path/to/app.js`。

在规则中，属性 [`test`](https://www.webpackjs.com/configuration/module/#rule-test), [`include`](https://www.webpackjs.com/configuration/module/#rule-include), [`exclude`](https://www.webpackjs.com/configuration/module/#rule-exclude) 和 [`resource`](https://www.webpackjs.com/configuration/module/#rule-resource) 对 resource 匹配，并且属性 [`issuer`](https://www.webpackjs.com/configuration/module/#rule-issuer) 对 issuer 匹配。

当使用多个条件时，所有条件都匹配。

> 小心！resource 是文件的_解析*路径，这意味着符号链接的资源是真正的路径，*而不是_符号链接位置。在使用工具来符号链接包的时候（如 `npm link`）比较好记，像 `/node_modules/` 等常见条件可能会不小心错过符号链接的文件。注意，可以通过 [`resolve.symlinks`](https://www.webpackjs.com/configuration/resolve#resolve-symlinks) 关闭符号链接解析（以便将资源解析为符号链接路径）。

###### Rule 结果

规则结果只在规则条件匹配时使用。

规则有两种输入值：

1. 应用的 loader：应用在 resource 上的 loader 数组。
2. Parser 选项：用于为模块创建解析器的选项对象。

这些属性会影响 loader：[`loader`](https://www.webpackjs.com/configuration/module/#rule-loader), [`options`](https://www.webpackjs.com/configuration/module/#rule-options-rule-query), [`use`](https://www.webpackjs.com/configuration/module/#rule-use)。

也兼容这些属性：[`query`](https://www.webpackjs.com/configuration/module/#rule-options-rule-query), [`loaders`](https://www.webpackjs.com/configuration/module/#rule-loaders)。

[`enforce`](https://www.webpackjs.com/configuration/module/#rule-enforce) 属性会影响 loader 种类。不论是普通的，前置的，后置的 loader。

[`parser`](https://www.webpackjs.com/configuration/module/#rule-parser) 属性会影响 parser 选项。

###### 嵌套的 Rule

可以使用属性 [`rules`](https://www.webpackjs.com/configuration/module/#rule-rules) 和 [`oneOf`](https://www.webpackjs.com/configuration/module/#rule-oneof) 指定嵌套规则。

这些规则用于在规则条件(rule condition)匹配时进行取值。

------

以上内容都是官网直接copy过来的，理解起来比较抽象，我们直接用demo来分析一下，我们从0开始搭建一个简单的vue项目：**webpack+vue+sass**

首先我们在src目录底下创建一个demo-vue.vue文件，

src/demo-vue.vue:

```vue
<template>
<div class="demo-vue">hello fox</div>
</template>
<script>
    export default {
        name: 'demo-vue',
    };
</script>
<style lang='scss' scoped>
.demo-vue{
	color: red;
}
</style>

```

然后修改一下我们的入口文件index.js，

src/index.js:

```js
__webpack_public_path__ = "http://localhost:8091/webpack-demo/lib/";
import demoVue from "./demo-vue.vue";
import Vue from "vue";
new Vue({
    el: "#app",
    render:(h)=>h(demoVue)
});
```

代码很简单，稍微有点vue基础的应该是没啥问题的，看不懂的也没关系，我们继续往下分析rule参数。

###### enforce

`string 可能的值有：`"pre" | "post"`` 

所有 loader 通过 `前置, 行内, 普通, 后置` 排序，并按此顺序使用。

普通的loader是从下往上使用。

比如我们demo中需要处理scss样式语法：

```scss
<style lang='scss' scoped>
.demo-vue{
	color: red;
}
</style>
```

所以我们需要去配置一下scss解析器，在配置之前我们需要安装一些依赖，

处理vue文件：

vue 、vue-loader、vue-loader-plugin、vue-template-compiler  `

```js
npm install -S vue && npm install -D vue-loader && npm install -D vue-loader-plugin && npm 
install -D vue-template-compiler
```

处理scss文件：

`sass、sass-loader、postcss-loader、autoprefixer、css-loader、style-loader`

大家一样安装一遍，别漏了，我就不演示了。

webpack在处理scss的时候顺序应该是这样的：

1. vue-loader 负责解析vue模版中的style标签中的scss内容。
2. sass-loader 负责解析scss为css。
3. postcss-loader 对css做优化处理（这里用到了自动添加前缀的插件autoprefixer）。
4. css-loader负责把处理完毕的css代码变成一个module。
5. style-loader获取css-loader处理过后的module，然后把动态创建style标签加载module内容。

所以我们修改一些我们的webpack配置文件，

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
                            ident: "postcss",
                            config: {
                                path: path.resolve(__dirname,"./postcss.config.js")
                            }
                        }
                    },
                    "sass-loader"
                ]
            }
        ]
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ]
};
```

因为postcss需要指定一个配置文件，所以我们在根目录指定一个postcss.config.js文件作为postcss-loader的参数，

postcss.config.js：

```js
module.exports={
    plugins:[
        require('autoprefixer')(),
    ]
};
```

autoprefixer又需要根据你浏览器的定义做前缀添加，所以我们在根目录创建一个.browserslistrc文件给autoprefixer插件，

.browserslistrc：

```js
> 0.25%, not dead
```

我们在讲babel的时候也提到了.browserslistrc文件，所以这里我就不分析了。

可以看到上面的配置文件，我们配置了一个.vue文件的loader “vue-loader”，然后配置了很多个loader来处理.scss文件.

我们运行一下webpack：

```js
➜  webpack-demo git:(master) ✗ npx webpack
Hash: 01d4acbf09e4ec864dc8
Version: webpack 5.0.0-beta.7
Time: 2076ms
Built at: 2020-07-09 14:04:46
1 asset
Entrypoint app = app.cb21e253f621ffc6.01d4acbf09e4ec86.app.js
./index.js 186 bytes [built]
./demo-vue.vue 1.19 KiB [built]
../node_modules/vue/dist/vue.runtime.esm.js 222 KiB [built]
./demo-vue.vue?vue&type=template&id=47a7e22a&scoped=true& 212 bytes [built]
./demo-vue.vue?vue&type=script&lang=js& 258 bytes [built]
./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 824 bytes [built]
../node_modules/vue-loader/lib/runtime/componentNormalizer.js 2.71 KiB [built]
../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=template&id=47a7e22a&scoped=true& 264 bytes [built]
../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=script&lang=js& 52 bytes [built]
../node_modules/style-loader/dist/cjs.js!../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src??ruleSet[0].rules[0].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 810 bytes [built]
../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js 6.64 KiB [built]
../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src??ruleSet[0].rules[0].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 278 bytes [built]
../node_modules/css-loader/dist/runtime/api.js 2.46 KiB [built]
    + 5 hidden modules
➜  webpack-demo git:(master) ✗ 

```

再看一下生成的文件lib/*：

lib/app.cb21e253f621ffc6.01d4acbf09e4ec86.app.js:

```js
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src/index.js??ruleSet[0].rules[0].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/vue-loader/lib/index.js??vue-loader-options!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src??ruleSet[0].rules[0].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_exports__, module */
/***/ ((module, exports, __webpack_require__) => {
  ...
```

代码有点多，而且很难看懂，我们还是在我们的test.html中引用试试，

test.html:

```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<div id="app"></div>
<script src="./lib/app.cb21e253f621ffc6.01d4acbf09e4ec86.app.js"></script>
</body>
</html>
```

然后运行浏览器：

![demo-vue](/Users/ocj1/doc/h5/study/webpack/webpack-demo/demo-vue.png)

可以看到，页面上已经显示了我们的“hello fox”并且scss样式也是起作用了，style-loader会在我们的html文件中插入以下代码：

```html
<style>.demo-vue[data-v-47a7e22a] {
  color: red;
}</style>
```

ok! 代码也讲完了，还是没讲到`enforce`的用法，demo的webpack配置中我们处理scss文件的时候用的rule配置是这样的：

```js
{
                test: /\.(sass|scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            config: {
                                path: path.resolve(__dirname,"./postcss.config.js")
                            }
                        }
                    },
                    "sass-loader"
                ]
            }
```

webpack默认顺序是（从下往上）: 

`vue-loader-->sass-loader-->postcss-loader-->css-loader-->style-loader` 

那如果我们需要改变它的默认顺序我们该怎么做呢？

我们给sass-loader加一个`enforce`选项“pre”，让sass-loader第一个执行，

webpack.config.js:

```js
{
                test: /\.(sass|scss)$/,
                enforce: "pre",
                use: "sass-loader",
            },
```

运行后会发现报错：

```js
ERROR in ./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& (../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src??ruleSet[0].rules[0].use!../node_modules/vue-loader/lib??vue-loader-options!../node_modules/sass-loader/dist/cjs.js!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true&)
Module build failed (from ../node_modules/sass-loader/dist/cjs.js):
SassError: expected "{".
   ╷
13 │ </style>

```

我们可以利用enforce修改一下loader的默认加载顺序。

###### exclude

`string、array、function`

哪些模块不需要被加载，如果你提供了 `Rule.exclude` 选项，就不能再提供 `Rule.resource`。

比如我们demo中sass-loader只加载.sass或.scss文件,我们就可以这样配置：

```js
 {
                exclude: (info)=>{
                    return !/\.(sass|scss)$/.test(info);
                },
                use: "sass-loader",
            },
```

###### include

string、array、function

跟exclude相反的操作，比如上面的配置我们可以用include这样来：

```js
  {
                include: (info)=>{
                    return /\.(sass|scss)$/.test(info);
                },
                use: "sass-loader",
            },
```

###### Issuer

规定了哪个文件发起的request才需要被loader，比如我们这里的scss是由demo-vue.vue文件发起的，所以可以用Issuer来设置只有当demo-vue.vue文件发起的.scss模块才解析：

```js
 {
                issuer: (info)=>{
                    return /\.(sass|scss)$/.test(info)&&!/demo-vue\.vue/.test(info);
                },
                use: "sass-loader",
            },
```

###### loader

`Rule.loader` 是 `Rule.use: [ { loader } ]` 的简写。详细请查看 [`Rule.use`](https://www.webpackjs.com/configuration/module/#rule-use) 和 [`UseEntry.loader`](https://www.webpackjs.com/configuration/module/#useentry)。

###### oneOf

当规则匹配时，只使用第一个匹配规则。

```javascript
{
  test: /.png/,
  oneOf: [
    {
      resourceQuery: /inline/, // pub1.png?inline
      use: 'url-loader'
    },
    {
      resourceQuery: /external/, // pub1.png?external
      use: 'file-loader'
    }
  ]
}
```

我们试一下，比如我们需要加载一张图片，demo根目录下的，pub1.png图片，首先我们安装一下url-loader跟file-loader：

- file-loader (会在output.path目录生成一个文件，返回这个文件的引用地址给调用处) 
- url-loader（文件size小于limit的话就直接把文件打成base64格式字符串，大于则用file-loader）

```
npm install -D url-loader && npm install -D file-loader
```

然后我们修改一下我们的demo-vue.vue文件，添加一个图片，

demo-vue.vue：

```vue
<template>
<div class="demo-vue">
    hello fox
    <img :src="pubImg">
</div>
</template>

<script>
    export default {
        name: 'demo-vue',
        data(){
            return {
                pubImg: require("../pub1.png?external").default
            }
        }
    };
</script>
<style lang='scss' scoped>
.demo-vue{
	color: red;
}
</style>

```

可以看到，我们用require加载了一张图片，然后给图片加了一个external后缀，然后我们配置一下webpack的配置文件，

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
                use: "style-loader",
            },
            {
                test: /\.(sass|scss)$/,
                use: "css-loader",
            },
            {
                test: /\.(sass|scss)$/,
                use: {
                    loader: "postcss-loader",
                    options: {
                        config: {
                            path: path.resolve(__dirname,"./postcss.config.js")
                        }
                    }
                },
            },
            {
                issuer: (info)=>{
                    return /\.(sass|scss)$/.test(info)&&!/demo-vue\.vue/.test(info);
                },
                use: "sass-loader",
            },
            {
                test: /\.png$/,
                oneOf: [
                    {
                        resourceQuery: /inline/,
                        loader: "url-loader",
                        options: {
                            limit: 1024*1024*10
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
    plugins: [
        new (require("vue-loader-plugin"))()
    ]
};
```

可以看到我们配置了两个loader，当图片指定了“inline”后缀就用url-loader，指定了“external”就使用file-loader。

上面demo我们指定的是“external”，也就是说会以原文件的形式输出到output.path目录，

我们运行webpack打包：

```js
63fe41824cb8236c0896a71b7df7f461.png
app.f18f2f6646d5afa5.3be9121297511f01.app.js
```

可以看到，生成了两个文件，我们运行一下test.html文件，

test.html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<div id="app"></div>
<script src="./lib/app.f18f2f6646d5afa5.3be9121297511f01.app.js"></script>
</body>
</html>
```

![oneof_result](/Users/ocj1/doc/h5/study/webpack/webpack-demo/oneof_result.png)



Ok！ 我们已经看到效果了，inline我就不测试了，小伙伴自己试试哦！

###### resource

[`条件`](https://www.webpackjs.com/configuration/module/#条件)会匹配 resource。既可以提供 `Rule.resource` 选项，也可以使用快捷选项 `Rule.test`，`Rule.exclude` 和 `Rule.include`。在 [`Rule` 条件](https://www.webpackjs.com/configuration/module/#rule-conditions) 中查看详细。

###### resourceQuery

[`条件`](https://www.webpackjs.com/configuration/module/#条件)会匹配 resourceQuery，请求资源的参数，上面在使用file-loader跟url-loader的时候使用过，就不演示了，比如：

```js
require("../pub1.png?external").default
```

external就是resourceQuery一部分，告诉webpack带有这个参数的时候才会用当前loader。

###### rules

[`规则`](https://www.webpackjs.com/configuration/module/#rule)数组，当规则匹配时使用。

###### test

如果你提供了一个 `Rule.test` 选项，就不能再提供 `Rule.resource`。详细请查看 [`Rule.resource`](https://www.webpackjs.com/configuration/module/#rule-resource) 和 [`Condition.test`](https://www.webpackjs.com/configuration/module/#条件)，跟include一样，利用正则表达式test判断，返回true才会用当前loader。

###### use

应用于模块的 [UseEntries](https://www.webpackjs.com/configuration/module/#useentry) 列表。每个入口(entry)指定使用一个 loader。

传递字符串（如：`use: [ "style-loader" ]`）是 loader 属性的简写方式（如：`use: [ { loader: "style-loader "} ]`）。

比如我们demo现在的配置文件为，

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
                use: "style-loader",
            },
            {
                test: /\.(sass|scss)$/,
                use: "css-loader",
            },
            {
                test: /\.(sass|scss)$/,
                use: {
                    loader: "postcss-loader",
                    options: {
                        config: {
                            path: path.resolve(__dirname,"./postcss.config.js")
                        }
                    }
                },
            },
            {
                issuer: (info)=>{
                    return /\.(sass|scss)$/.test(info)&&!/demo-vue\.vue/.test(info);
                },
                use: "sass-loader",
            },
            {
                test: /\.png$/,
                oneOf: [
                    {
                        resourceQuery: /inline/,
                        loader: "url-loader",
                        options: {
                            limit: 1024*1024*10
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
    plugins: [
        new (require("vue-loader-plugin"))()
    ]
};
```

我们对.scss文件的匹配用了很多loader，但是这些loader争对的都是.scss文件，所以我们可以利用use合并这些loader，

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
                                path: path.resolve(__dirname,"./postcss.config.js")
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
                            limit: 1024*1024*10
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
    plugins: [
        new (require("vue-loader-plugin"))()
    ]
};
```

ok! 效果是一样的，我就不演示了。

###### 条件

条件可以是这些之一：

- 字符串：匹配输入必须以提供的字符串开始。是的。目录绝对路径或文件绝对路径。
- 正则表达式：test 输入值。
- 函数：调用输入的函数，必须返回一个真值(truthy value)以匹配。
- 条件数组：至少一个匹配条件。
- 对象：匹配所有属性。每个属性都有一个定义行为。

`{ test: Condition }`：匹配特定条件。一般是提供一个正则表达式或正则表达式的数组，但这不是强制的。

`{ include: Condition }`：匹配特定条件。一般是提供一个字符串或者字符串数组，但这不是强制的。

`{ exclude: Condition }`：排除特定条件。一般是提供一个字符串或字符串数组，但这不是强制的。

`{ and: [Condition] }`：必须匹配数组中的所有条件

`{ or: [Condition] }`：匹配数组中任何一个条件

`{ not: [Condition] }`：必须排除这个条件

**示例:**

```js
{
  test: /\.css$/,
  include: [
    path.resolve(__dirname, "app/styles"),
    path.resolve(__dirname, "vendor/styles")
  ]
}
```

### Resolve

`object`

配置模块如何解析。例如，当在 ES2015 中调用 `import "lodash"`，`resolve` 选项能够对 webpack 查找 `"lodash"` 的方式去做修改。

------

以上是官方的介绍，其实webpack在解析代码的时候回去加载模块（也就是读取文件），那么我们在node中读取文件路径可以用path.resolve，webpack的resolve也差不多就是这个意思了，webpack默认使用enhanced-resolve第三方库去解析文件路径，源码对应：

lib/Compiler.js

```js
...
/** @type {ResolverFactory} */
this.resolverFactory = new ResolverFactory();
...
```

lib/ResolverFactory.js:

```js
...
const Factory = require("enhanced-resolve").ResolverFactory;
...
```

enhanced-resolve:

```markdown
- plugin system
- provide a custom filesystem
- sync and async node.js filesystems included

```

ok，概念我们就介绍到这里了，我们下面结合demo用一下resolve的配置。

#### alias

`object`

设置一个路径的别名信息。

创建 `import` 或 `require` 的别名，来确保模块引入变得更简单。例如我们demo中，一些位于 `src/` 文件夹下的常用模块：

```js
alias: {
 	DemoVue: path.resolve(__dirname,"./src/demo-vue.vue")
}
```

之前我们在index.js中引用demo-vue.vue文件的时候是这样的：

src/index.js

```js
__webpack_public_path__ = "http://localhost:8091/webpack-demo/lib/";
import demoVue from "./demo-vue.vue";
import Vue from "vue";
new Vue({
    el: "#app",
    render:(h)=>h(demoVue)
});
```

现在换成别名的话我们可以这样导入了，

src/index.js：

```js
__webpack_public_path__ = "http://localhost:8091/webpack-demo/lib/";
import demoVue from "DemoVue";
import Vue from "vue";
new Vue({
    el: "#app",
    render:(h)=>h(demoVue)
});
```

也可以在给定对象的键后的末尾添加 `$`，以表示精准匹配：

```js
alias: {
  DemoVue$: path.resolve(__dirname,"./src/demo-vue.vue")
}
```

这将产生以下结果：

```js
import DemoVue from 'DemoVue'; // 精确匹配，所以 src/demo-vue.vue 被解析和导入
import DemoVue from 'DemoVue/file.js'; // 非精确匹配，触发普通解析

//如果不加$符号的话 以下解析将会报错 因为webpack会直接拼接path “/src/demo-vue.vue/file.js”报错
import DemoVue from 'DemoVue/file.js';
```

#### Extensions

`[string] 默认为 ['.wasm', '.mjs', '.js', '.json']`

能够使用户在引入模块时不带文件后缀，比如我们demo中引入.vue文件，我们也让它可以省略后缀，我们首先修改一些配置文件，

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
                                path: path.resolve(__dirname,"./postcss.config.js")
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
                            limit: 1024*1024*10
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
            DemoVue: path.resolve(__dirname,"./src/demo-vue.vue")
        },
        extensions: ['.wasm', '.js', '.json','.vue']
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ],
};
```

然后我们导入.vue文件的时候就可以不用写后缀了：

```js
import demoVue from "./demo-vue";
```

默认后缀的源码为：

lib/WebpackOptionsDefaulter.js

```js
...
this.set("resolve.extensions", "make", options =>
			[options.experiments.mjs && ".mjs", ".js", ".json", ".wasm"].filter(
				Boolean
			)
		);
...
```

#### enforceExtension

boolean 默认 false

如果为true将不允许无扩展名(extension-less)文件，这个选项其实就是extendsion选项的开关。

#### enforceModuleExtension

`boolean`

对模块是否需要使用的扩展（例如 loader）。默认：

```js
enforceModuleExtension: false
```

*Removed in webpack 5*

#### mainFields

`array` 

当从 npm 包中导入模块时（例如，`import * as D3 from "d3"`），此选项将决定在 `package.json` 中使用哪个字段导入模块。根据 webpack 配置中指定的 [`target`](https://www.webpackjs.com/concepts/targets) 不同，默认值也会有所不同。

当 `target` 属性设置为 `webworker`, `web` 或者没有指定，默认值为：

```js
mainFields: ["browser", "module", "main"]
```

对于其他任意的 target（包括 `node`），默认值为：

```js
mainFields: ["module", "main"]
```

比如我们demo中的第三方依赖vue，我们打开vue的pakcage.json文件看看，

node_modules/vue/package.json：

```json
{
  ...
  "main": "dist/vue.runtime.common.js",
  "module": "dist/vue.runtime.esm.js",
  ...
}
```

可以看到，vue指定了两个入口，所以demo中按照规则会优先加载“module”。

#### modules

`array = ['node_modules']`

告诉 webpack 解析模块时应该搜索的目录。

绝对路径和相对路径都能使用，但是要知道它们之间有一点差异。

通过查看当前目录以及祖先路径（即 `./node_modules`, `../node_modules` 等等），相对路径将类似于 Node 查找 'node_modules' 的方式进行查找。

使用绝对路径，将只在给定目录中搜索。

`resolve.modules` defaults to:

```js
modules: ["node_modules"]
```

如果你想要添加一个目录到模块搜索目录，此目录优先于 `node_modules/` 搜索：

```js
modules: [path.resolve(__dirname, "src"), "node_modules"]
```

比如我们需要在index.js中去加载src/demo-public.js文件，当我们没有指定路径加载的时候，

src/index.js:

```js
import "demo-publicpath";
```

打包编译会报错：

```
ERROR in ./index.js 4:0-25
Module not found: Error: Can't resolve 'demo-publicpath' in '/Users/ocj1/doc/h5/study/webpack/webpack-demo/src'

➜  webpack-demo git:(master) ✗ npx webpack

```

然后我们把src也添加进modules，

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
                                path: path.resolve(__dirname,"./postcss.config.js")
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
                            limit: 1024*1024*10
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
            DemoVue: path.resolve(__dirname,"./src/demo-vue.vue")
        },
        extensions: ['.wasm', '.mjs', '.js', '.json','.vue'],
        modules: [path.resolve(__dirname, "src"), "node_modules"]
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ],
};
```

再次打包编译是ok的。

#### unsafeCache

`regex` `array` `boolean`

启用，会主动缓存模块，但并**不安全**。传递 `true` 将缓存一切。默认：

```js
unsafeCache: true
```

正则表达式，或正则表达式数组，可以用于匹配文件路径或只缓存某些模块。例如，只缓存 utilities 模块：

```js
unsafeCache: /src\/utilities/
```

这个选项其实是加快webpack打包速度的选项，比如我们上面说的./src/demo-publicpath.js文件，我们认为它是不会改变的，所以我们就把它加入到缓存中，

```js
 resolve: {
        alias: {
            DemoVue: path.resolve(__dirname,"./src/demo-vue.vue")
        },
        extensions: ['.wasm', '.mjs', '.js', '.json','.vue'],
        modules: [path.resolve(__dirname, "src"), "node_modules"],
        unsafeCache: /demo-publicpath/,
    },
```

这样webpack就不会每次都去做文件读取了，如果缓存中有就直接读缓存了。

好啦，其实webpack的resolve也是依赖的另外一个第三方库，同样是在webpack组织下，估计是被收编了，resolve的更多参数和用法可以参考另外一个库：

[https://github.com/webpack/enhanced-resolve](https://github.com/webpack/enhanced-resolve)

### ResolveLoader

`object`

webpack加载loader的时候也是通过resolve去加载的，但是webpack单独把loader的配置抽离出来了，这组选项与上面的 `resolve` 对象的属性集合相同，但仅用于解析 webpack 的 [loader](https://www.webpackjs.com/concepts/loaders) 包。默认：

```js
{
  modules: [ 'node_modules' ],
  extensions: [ '.js', '.json' ],
  mainFields: [ 'loader', 'main' ]
}
```

> 注意，这里你可以使用别名，并且其他特性类似于 resolve 对象。例如，`{ txt: 'raw-loader' }` 会使用 `raw-loader` 去 shim(填充) `txt!templates/demo.txt`。

### plugins

`array`

webpack 插件列表, 比如我们上面用了一个vue-loader-plugin插件:

```js
plugins: [
        new (require("vue-loader-plugin"))()
    ],
```

webpack社区有很多插件，大家可以先浏览一下：

[https://webpack.js.org/plugins/](https://webpack.js.org/plugins/)

后面我们会在项目实战的时候介绍一些常用插件的用法，最后还会去自定义一个插件。

👌～ webpack的基本配置内容我们结合demo跟webpack的官网差不多就已经结束了，后面我们会针对开发环境还有包优化做解析（因为一篇文章实在是太长了～ 😂），下期见！！



demo源码地址：[https://github.com/913453448/webpack-demo.git](https://github.com/913453448/webpack-demo.git)