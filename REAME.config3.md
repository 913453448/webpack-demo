## 前言

我们继续前面的内容，把webpack剩下的配置项撸一遍，推荐大家先看一下前面的文章：

- [webpack源码解析一](https://vvbug.blog.csdn.net/article/details/103531670)
- [webpack源码解析二（html-webpack-plugin插件）](https://vvbug.blog.csdn.net/article/details/103531670)
- [webpack源码解析三](https://vvbug.blog.csdn.net/article/details/107233952)
- [webpack源码解析四](https://vvbug.blog.csdn.net/article/details/107300928)

## 配置

### devtool

此选项控制是否生成，以及如何生成 source map。

#### **什么是Source map？**

简单说，Source map就是一个信息文件，里面储存着位置信息。也就是说，转换后的代码的每一个位置，所对应的转换前的位置（source map更多的介绍跟怎么使用就不在这里分析了）

`string` or `false`

选择一种 [source map](http://blog.teamtreehouse.com/introduction-source-maps) 格式来增强调试过程。不同的值会明显影响到构建(build)和重新构建(rebuild)的速度。

> webpack 仓库中包含一个 [显示所有 `devtool` 变体效果的示例](https://github.com/webpack/webpack/tree/master/examples/source-map)。这些例子或许会有助于你理解这些差异之处。

> 你可以直接使用 `SourceMapDevToolPlugin`/`EvalSourceMapDevToolPlugin` 来替代使用 `devtool` 选项，因为它有更多的选项。切勿同时使用 `devtool` 选项和 `SourceMapDevToolPlugin`/`EvalSourceMapDevToolPlugin` 插件。`devtool` 选项在内部添加过这些插件，所以你最终将应用两次插件。

|                                          |          |              |          |                        |
| :--------------------------------------- | :------- | :----------- | :------- | :--------------------- |
| devtool                                  | 构建速度 | 重新构建速度 | 生产环境 | 品质(quality)          |
| (none)                                   | fastest  | fastest      | yes      | 打包后的代码           |
| eval                                     | fastest  | fastest      | no       | 生成后的代码           |
| eval-cheap-source-map                    | fast     | faster       | no       | 转换过的代码（仅限行） |
| eval-cheap-module-source-map             | slow     | faster       | no       | 原始源代码（仅限行）   |
| eval-source-map                          | slowest  | fast         | no       | 原始代码               |
| eval-nosources-source-map                |          |              |          |                        |
| eval-nosources-cheap-source-map          |          |              |          |                        |
| eval-nosources-cheap-module-source-map   |          |              |          |                        |
| cheap-source-map                         | fast     | slow         | yes      | 转换过的代码（仅限行） |
| cheap-module-source-map                  | slow     | slower       | yes      | 原始源代码（仅限行）   |
| inline-cheap-source-map                  | fast     | slow         | no       | 转换过的代码（仅限行） |
| inline-cheap-module-source-map           | slow     | slower       | no       | 原始源代码（仅限行）   |
| inline-source-map                        | slowest  | slowest      | no       | 原始代码               |
| inline-nosources-source-map              |          |              |          |                        |
| inline-nosources-cheap-source-map        |          |              |          |                        |
| inline-nosources-cheap-module-source-map |          |              |          |                        |
| source-map                               | slowest  | slowest      | yes      | 原始代码               |
| hidden-source-map                        | slowest  | slowest      | yes      | 原始代码               |
| hidden-nosources-source-map              |          |              |          |                        |
| hidden-nosources-cheap-source-map        |          |              |          |                        |
| hidden-nosources-cheap-module-source-map |          |              |          |                        |
| hidden-cheap-source-map                  |          |              |          |                        |
| hidden-cheap-module-source-map           |          |              |          |                        |
| nosources-source-map                     | slowest  | slowest      | yes      | 无源代码内容           |
| nosources-cheap-source-map               |          |              |          |                        |
| nosources-cheap-module-source-map        |          |              |          |                        |

其中一些值适用于开发环境，一些适用于生产环境。对于开发环境，通常希望更快速的 source map，需要添加到 bundle 中以增加体积为代价，但是对于生产环境，则希望更精准的 source map，需要从 bundle 中分离并独立存在。

> Chrome 中的 source map 有一些问题。[我们需要你的帮助！](https://github.com/webpack/webpack/issues/3165)。

> 查看 [`output.sourceMapFilename`](https://www.webpackjs.com/configuration/output#output-sourcemapfilename) 自定义生成的 source map 的文件名。

#### 品质说明(quality)

`打包后的代码` - 将所有生成的代码视为一大块代码。你看不到相互分离的模块。

`生成后的代码` - 每个模块相互分离，并用模块名称进行注释。可以看到 webpack 生成的代码。示例：你会看到类似 `var module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(42); module__WEBPACK_IMPORTED_MODULE_1__.a();`，而不是 `import {test} from "module"; test();`。

`转换过的代码` - 每个模块相互分离，并用模块名称进行注释。可以看到 webpack 转换前、loader 转译后的代码。示例：你会看到类似 `import {test} from "module"; var A = function(_test) { ... }(test);`，而不是 `import {test} from "module"; class A extends test {}`。

`原始源代码` - 每个模块相互分离，并用模块名称进行注释。你会看到转译之前的代码，正如编写它时。这取决于 loader 支持。

`无源代码内容` - source map 中不包含源代码内容。浏览器通常会尝试从 web 服务器或文件系统加载源代码。你必须确保正确设置 [`output.devtoolModuleFilenameTemplate`](https://www.webpackjs.com/configuration/output/#output-devtoolmodulefilenametemplate)，以匹配源代码的 url。

`（仅限行）` - source map 被简化为每行一个映射。这通常意味着每个语句只有一个映射（假设你使用这种方式）。这会妨碍你在语句级别上调试执行，也会妨碍你在每行的一些列上设置断点。与压缩后的代码组合后，映射关系是不可能实现的，因为压缩工具通常只会输出一行。

#### 对于开发环境

以下选项非常适合开发环境：

`eval` - 每个模块都使用 `eval()` 执行，并且都有 `//@ sourceURL`。此选项会非常快地构建。主要缺点是，由于会映射到转换后的代码，而不是映射到原始代码（没有从 loader 中获取 source map），所以不能正确的显示行数。

`eval-source-map` - 每个模块使用 `eval()` 执行，并且 source map 转换为 DataUrl 后添加到 `eval()` 中。初始化 source map 时比较慢，但是会在重新构建时提供比较快的速度，并且生成实际的文件。行数能够正确映射，因为会映射到原始代码中。它会生成用于开发环境的最佳品质的 source map。

`cheap-eval-source-map` - 类似 `eval-source-map`，每个模块使用 `eval()` 执行。这是 "cheap(低开销)" 的 source map，因为它没有生成列映射(column mapping)，只是映射行数。它会忽略源自 loader 的 source map，并且仅显示转译后的代码，就像 `eval` devtool。

`cheap-module-eval-source-map` - 类似 `cheap-eval-source-map`，并且，在这种情况下，源自 loader 的 source map 会得到更好的处理结果。然而，loader source map 会被简化为每行一个映射(mapping)。

#### 特定场景

以下选项对于开发环境和生产环境并不理想。他们是一些特定场景下需要的，例如，针对一些第三方工具。

`inline-source-map` - source map 转换为 DataUrl 后添加到 bundle 中。

`cheap-source-map` - 没有列映射(column mapping)的 source map，忽略 loader source map。

`inline-cheap-source-map` - 类似 `cheap-source-map`，但是 source map 转换为 DataUrl 后添加到 bundle 中。

`cheap-module-source-map` - 没有列映射(column mapping)的 source map，将 loader source map 简化为每行一个映射(mapping)。

`inline-cheap-module-source-map` - 类似 `cheap-module-source-map`，但是 source mapp 转换为 DataUrl 添加到 bundle 中。

#### 对于生产环境

这些选项通常用于生产环境中：

`(none)`（省略 `devtool` 选项） - 不生成 source map。这是一个不错的选择。

`source-map` - 整个 source map 作为一个单独的文件生成。它为 bundle 添加了一个引用注释，以便开发工具知道在哪里可以找到它。

> 你应该将你的服务器配置为，不允许普通用户访问 source map 文件！

`hidden-source-map` - 与 `source-map` 相同，但不会为 bundle 添加引用注释。如果你只想 source map 映射那些源自错误报告的错误堆栈跟踪信息，但不想为浏览器开发工具暴露你的 source map，这个选项会很有用。

> 你不应将 source map 文件部署到 web 服务器。而是只将其用于错误报告工具。

`nosources-source-map` - 创建的 source map 不包含 `sourcesContent(源代码内容)`。它可以用来映射客户端上的堆栈跟踪，而无须暴露所有的源代码。你可以将 source map 文件部署到 web 服务器。

> 这仍然会暴露反编译后的文件名和结构，但它不会暴露原始代码。

> 在使用 `uglifyjs-webpack-plugin` 时 *你必须提供* `sourceMap：true` *选项来启用 source map 支持。*

------

以上是官网的描述，我们大概知道了sourcemap这个东西，下面我们结合demo对几个常用的devtool做一下测试。

#### eval(默认)

打包过后的代码。

对应配置文件，

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
        open: true,
        useLocalIp: true,
        overlay: true,
        publicPath: "/dist/"
    },
    devtool: "eval"
};
```

然后运行webpack-dev-server：

```bash
192:webpack-demo yinqingyang$ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server
```

然后访问入口文件：http://192.168.2.103:8090/dist/app.dce652981f001848.1b5476d5f9831bfb.app

![sourcemap-eval](/Users/yinqingyang/前端架构系列之(webpack)/webpack-demo/sourcemap-eval.png)

可以看到，浏览器中显示了我们打包过后的文件，比如index.js:

```js
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _demo_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./demo-vue */ "./demo-vue.vue");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue */ "../node_modules/vue/dist/vue.runtime.esm.js");
/* harmony import */ var demo_publicpath__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! demo-publicpath */ "./demo-publicpath.js");
__webpack_require__.p = "/";



const root=document.createElement("div");
root.id="app";
document.body.appendChild(root)
const app=new vue__WEBPACK_IMPORTED_MODULE_1__.default({
    render:(h)=>h(_demo_vue__WEBPACK_IMPORTED_MODULE_0__.default)
});
app.$mount(root);

```



#### false

关闭生成source map，我们修改一下配置文件，

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
        open: true,
        useLocalIp: true,
        overlay: true,
        publicPath: "/dist/"
    },
    devtool: false
};
```



然后运行webpack-dev-server：

```bash
192:webpack-demo yinqingyang$ node ./node_modules/webpack/node_modules/.bin/webpack-dev-server
```

然后访问入口文件：http://192.168.2.103:8090/dist/app.b4fe93c6b41eec70.7b916ef02bd517e8.app

![sourcemap-false](/Users/yinqingyang/前端架构系列之(webpack)/webpack-demo/sourcemap-false.png)

可以看到，没有对应的sourcemap展示。

#### eval-cheap-module-source-map

原始的代码（仅限行）

![sourcemap-eval-cheap1](/Users/yinqingyang/前端架构系列之(webpack)/webpack-demo/sourcemap-eval-cheap1.png)

Ok! 可以看到，webpack给我们展示了demo-vue.vue的原始代码，这样我们断点就清晰多了，index.html也是会源码显示，但是会发现并没有层级的概念，都在一个目录里面，这就是“eval-cheap-module-source-map”的用法。

#### 建议

ok，其它的就不演示了，小伙伴自己跑跑看效果，在平时项目中一般建议用“eval-cheap-module-source-map”，这样速度跟调试都还可以，也不要被网上或者别人说的限定死，要灵活运用，比如你工程很小，那速度慢也慢不到哪去，直接声明“source-map”也是可以的。

**生成环境一定不能打开devtool哦！**

源码：

当然，你也可以不用配置devtool，直接搭配使用plugin也是可以的，比如源码：

lib/WebpackOptionsApply.js

```js
...
if (options.devtool) {
			if (options.devtool.includes("source-map")) {
				const hidden = options.devtool.includes("hidden");
				const inline = options.devtool.includes("inline");
				const evalWrapped = options.devtool.includes("eval");
				const cheap = options.devtool.includes("cheap");
				const moduleMaps = options.devtool.includes("module");
				const noSources = options.devtool.includes("nosources");
				const Plugin = evalWrapped
					? require("./EvalSourceMapDevToolPlugin")
					: require("./SourceMapDevToolPlugin");
				new Plugin({
					filename: inline ? null : options.output.sourceMapFilename,
					moduleFilenameTemplate: options.output.devtoolModuleFilenameTemplate,
					fallbackModuleFilenameTemplate:
						options.output.devtoolFallbackModuleFilenameTemplate,
					append: hidden ? false : undefined,
					module: moduleMaps ? true : cheap ? false : true,
					columns: cheap ? false : true,
					noSources: noSources,
					namespace: options.output.devtoolNamespace
				}).apply(compiler);
			} else if (options.devtool.includes("eval")) {
				const EvalDevToolModulePlugin = require("./EvalDevToolModulePlugin");
				new EvalDevToolModulePlugin({
					moduleFilenameTemplate: options.output.devtoolModuleFilenameTemplate,
					namespace: options.output.devtoolNamespace
				}).apply(compiler);
			}
		}
...
```

### target

`string | function(compiler)`

告知 webpack 为目标(target)指定一个环境,webpack 能够为多种环境或 *target* 构建编译。

webpack内置的target等于让你选择某个target后，webpack会为特定的target导入一组默认插件，我们直接找到源码：

lib/WebpackOptionsApply.js

```js
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
				case "webworker": {
					const WebWorkerTemplatePlugin = require("./webworker/WebWorkerTemplatePlugin");
					const FetchCompileWasmPlugin = require("./web/FetchCompileWasmPlugin");
					const FetchCompileAsyncWasmPlugin = require("./web/FetchCompileAsyncWasmPlugin");
					const NodeSourcePlugin = require("./node/NodeSourcePlugin");
					const StartupChunkDependenciesPlugin = require("./runtime/StartupChunkDependenciesPlugin");
					new WebWorkerTemplatePlugin().apply(compiler);
					new FetchCompileWasmPlugin({
						mangleImports: options.optimization.mangleWasmImports
					}).apply(compiler);
					new FetchCompileAsyncWasmPlugin().apply(compiler);
					new NodeSourcePlugin(options.node).apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					new StartupChunkDependenciesPlugin({
						asyncChunkLoading: true
					}).apply(compiler);
					break;
				}
				case "node":
				case "async-node": {
					const NodeTemplatePlugin = require("./node/NodeTemplatePlugin");
					const ReadFileCompileWasmPlugin = require("./node/ReadFileCompileWasmPlugin");
					const ReadFileCompileAsyncWasmPlugin = require("./node/ReadFileCompileAsyncWasmPlugin");
					const NodeTargetPlugin = require("./node/NodeTargetPlugin");
					const StartupChunkDependenciesPlugin = require("./runtime/StartupChunkDependenciesPlugin");
					new NodeTemplatePlugin({
						asyncChunkLoading: options.target === "async-node"
					}).apply(compiler);
					new ReadFileCompileWasmPlugin({
						mangleImports: options.optimization.mangleWasmImports
					}).apply(compiler);
					new ReadFileCompileAsyncWasmPlugin().apply(compiler);
					new NodeTargetPlugin().apply(compiler);
					new LoaderTargetPlugin("node").apply(compiler);
					new StartupChunkDependenciesPlugin({
						asyncChunkLoading: options.target === "async-node"
					}).apply(compiler);
					break;
				}
				case "node-webkit": {
					const JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
					const NodeTargetPlugin = require("./node/NodeTargetPlugin");
					const ExternalsPlugin = require("./ExternalsPlugin");
					const StartupChunkDependenciesPlugin = require("./runtime/StartupChunkDependenciesPlugin");
					new JsonpTemplatePlugin().apply(compiler);
					new NodeTargetPlugin().apply(compiler);
					new ExternalsPlugin("commonjs", "nw.gui").apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					new StartupChunkDependenciesPlugin({
						asyncChunkLoading: true
					}).apply(compiler);
					break;
				}
				case "electron-main": {
					const NodeTemplatePlugin = require("./node/NodeTemplatePlugin");
					const NodeTargetPlugin = require("./node/NodeTargetPlugin");
					const ExternalsPlugin = require("./ExternalsPlugin");
					const StartupChunkDependenciesPlugin = require("./runtime/StartupChunkDependenciesPlugin");
					new NodeTemplatePlugin({
						asyncChunkLoading: true
					}).apply(compiler);
					new NodeTargetPlugin().apply(compiler);
					new ExternalsPlugin("commonjs", [
						"app",
						"auto-updater",
						"browser-window",
						"clipboard",
						"content-tracing",
						"crash-reporter",
						"dialog",
						"electron",
						"global-shortcut",
						"ipc",
						"ipc-main",
						"menu",
						"menu-item",
						"native-image",
						"original-fs",
						"power-monitor",
						"power-save-blocker",
						"protocol",
						"screen",
						"session",
						"shell",
						"tray",
						"web-contents"
					]).apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					new StartupChunkDependenciesPlugin({
						asyncChunkLoading: true
					}).apply(compiler);
					break;
				}
				case "electron-renderer":
				case "electron-preload": {
					const FetchCompileWasmPlugin = require("./web/FetchCompileWasmPlugin");
					const FetchCompileAsyncWasmPlugin = require("./web/FetchCompileAsyncWasmPlugin");
					const NodeTargetPlugin = require("./node/NodeTargetPlugin");
					const ExternalsPlugin = require("./ExternalsPlugin");
					if (options.target === "electron-renderer") {
						const JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
						new JsonpTemplatePlugin().apply(compiler);
					} else if (options.target === "electron-preload") {
						const NodeTemplatePlugin = require("./node/NodeTemplatePlugin");
						new NodeTemplatePlugin({
							asyncChunkLoading: true
						}).apply(compiler);
					}
					new FetchCompileWasmPlugin({
						mangleImports: options.optimization.mangleWasmImports
					}).apply(compiler);
					new FetchCompileAsyncWasmPlugin().apply(compiler);
					new NodeTargetPlugin().apply(compiler);
					new ExternalsPlugin("commonjs", [
						"clipboard",
						"crash-reporter",
						"desktop-capturer",
						"electron",
						"ipc",
						"ipc-renderer",
						"native-image",
						"original-fs",
						"remote",
						"screen",
						"shell",
						"web-frame"
					]).apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					break;
				}
				default:
					throw new Error("Unsupported target '" + options.target + "'.");
			}
		}

```

可以看到，默认有：web、webworker、node、async-node、node-webkit、electron-main、electron-renderer、electron-preload，我们浏览器应用默认用的是web选项，然后webpack会对特定的target导入一些基础配置：

```js
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
```

除了默认的一些配置外，一些插件可能也需要利用target做不同的操作。

### externals

```
string` `array` `object` `function` `regex
```

**防止**将某些 `import` 的包(package)**打包**到 bundle 中，而是在运行时(runtime)再去从外部获取这些*扩展依赖(external dependencies)*。

例如，从 CDN 引入 [jQuery](https://jquery.com/)，而不是把它打包：

**index.html**

```html
<script
  src="https://code.jquery.com/jquery-3.1.0.js"
  integrity="sha256-slogkvB1K3VOkzAI8QITxV3VzpOnkeNVsKvtkYLMjfk="
  crossorigin="anonymous">
</script>
```

**webpack.config.js**

```js
externals: {
  jquery: 'jQuery'
}
```

这样就剥离了那些不需要改动的依赖模块，换句话，下面展示的代码还可以正常运行：

```js
import $ from 'jquery';

$('.my-element').animate(...);
```

具有外部依赖(external dependency)的 bundle 可以在各种模块上下文(module context)中使用，例如 [CommonJS, AMD, 全局变量和 ES2015 模块](https://www.webpackjs.com/concepts/modules)。外部 library 可能是以下任何一种形式：

- **root**：可以通过一个全局变量访问 library（例如，通过 script 标签）。
- **commonjs**：可以将 library 作为一个 CommonJS 模块访问。
- **commonjs2**：和上面的类似，但导出的是 `module.exports.default`.
- **amd**：类似于 `commonjs`，但使用 AMD 模块系统。

可以接受各种语法……

#### string

请查看上面的例子。属性名称是 `jquery`，表示应该排除 `import $ from 'jquery'` 中的 `jquery` 模块。为了替换这个模块，`jQuery` 的值将被用来检索一个全局的 `jQuery` 变量。换句话说，当设置为一个字符串时，它将被视为`全局的`（定义在上面和下面）。

#### array

```js
externals: {
  subtract: ['./math', 'subtract']
}
```

`subtract: ['./math', 'subtract']` 转换为父子结构，其中 `./math` 是父模块，而 bundle 只引用 `subtract` 变量下的子集。

#### object

```js
externals : {
  react: 'react'
}

// 或者

externals : {
  lodash : {
    commonjs: "lodash",
    amd: "lodash",
    root: "_" // 指向全局变量
  }
}

// 或者

externals : {
  subtract : {
    root: ["math", "subtract"]
  }
}
```

此语法用于描述外部 library 所有可用的访问方式。这里 `lodash` 这个外部 library 可以在 AMD 和 CommonJS 模块系统中通过 `lodash` 访问，但在全局变量形式下用 `_` 访问。`subtract` 可以通过全局 `math` 对象下的属性 `subtract` 访问（例如 `window['math']['subtract']`）。

#### function

It might be useful to define your own function to control the behavior of what you want to externalize from webpack. [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals), for example, excludes all modules from the `node_modules` directory and provides some options to, for example, whitelist packages.

It basically comes down to this:

```js
externals: [
  function(context, request, callback) {
    if (/^yourregex$/.test(request)){
      return callback(null, 'commonjs ' + request);
    }
    callback();
  }
],
```

The `'commonjs ' + request` defines the type of module that needs to be externalized.

#### regex

Every dependency that matches the given regular expression will be excluded from the output bundles.

```js
externals: /^(jquery|\$)$/i
```

In this case any dependency named `jQuery`, capitalized or not, or `$` would be externalized.

------

以上是官网的描述，比如我们[demo项目](https://github.com/913453448/webpack-demo.git)中使用了babel-polyfill，也如果在test.html中以cdn又引入了一遍的话，那就会重复引用了，所以我们直接把babel-polyfill当成外部模块就ok了，所以我们可以改一下配置文件：

webpack.config.js

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    entry: ["babel-polyfill","./index.js"]
    // entry: {
    //     app: ["./index.js"]
    // },
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
        liveReload: false,
        open: true,
        useLocalIp: true,
        overlay: true,
        publicPath: "/dist/"
    },
    devtool: "source-map",
    externals: /babel-polyfill/
};
```

这样webpack打包的时候就不会去加载babel-polyfill了。

### performance

这些选项可以控制 webpack 如何通知「资源(asset)和入口起点超过指定文件限制」。 此功能受到 [webpack 性能评估](https://github.com/webpack/webpack/issues/3216)的启发。

#### `performance`

`object`

配置如何展示性能提示。例如，如果一个资源超过 250kb，webpack 会对此输出一个警告来通知你。

#### `performance.hints`

`false | "error" | "warning"`

打开/关闭提示。此外，当找到提示时，告诉 webpack 抛出一个错误或警告。此属性默认设置为 `"warning"`。

给定一个创建后超过 250kb 的资源：

```js
performance: {
  hints: false
}
```

不展示警告或错误提示。

```js
performance: {
  hints: "warning"
}
```

将展示一条警告，通知你这是体积大的资源。在开发环境，我们推荐这样。

```js
performance: {
  hints: "error"
}
```

将展示一条错误，通知你这是体积大的资源。在生产环境构建时，我们推荐使用 `hints: "error"`，有助于防止把体积巨大的 bundle 部署到生产环境，从而影响网页的性能。

#### `performance.maxEntrypointSize`

```
int
```

入口起点表示针对指定的入口，对于所有资源，要充分利用初始加载时(initial load time)期间。此选项根据入口起点的最大体积，控制 webpack 何时生成性能提示。默认值是：`250000` (bytes)。

```js
performance: {
  maxEntrypointSize: 400000
}
```

#### `performance.maxAssetSize`

`int`

资源(asset)是从 webpack 生成的任何文件。此选项根据单个资源体积，控制 webpack 何时生成性能提示。默认值是：`250000` (bytes)。

```js
performance: {
  maxAssetSize: 100000
}
```

#### `performance.assetFilter`

`Function`

此属性允许 webpack 控制用于计算性能提示的文件。默认函数如下：

```js
function(assetFilename) {
    return !(/\.map$/.test(assetFilename))
};
```

你可以通过传递自己的函数来覆盖此属性：

```js
performance: {
  assetFilter: function(assetFilename) {
    return assetFilename.endsWith('.js');
  }
}
```

以上示例将只给出 `.js` 文件的性能提示。

------

比如我们项目中限定一下，当打包出来的文件超过1kb都提示错误，

webpack.config.js:

```js
const path = require("path");
module.exports = {
    mode: "development",
    context: path.resolve(__dirname, "./src"),
    entry: ["babel-polyfill","./index.js"],
    // entry: {
    //     app: ["./index.js"]
    // },
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
        liveReload: false,
        open: true,
        useLocalIp: true,
        overlay: true,
        publicPath: "/dist/"
    },
    devtool: "source-map",
    externals: /babel-polyfill/,
    performance: {
        hints: "error",
        maxEntrypointSize: 1024
    }
};
```

然后我们运行webpack打包：

```bash
192:webpack-demo yinqingyang$ npx webpack
Hash: 0ed0b14f25767f823548
Version: webpack 5.0.0-beta.7
Time: 1421ms
Built at: 2020-07-12 18:34:37
                                             Asset      Size
              63fe41824cb8236c0896a71b7df7f461.png  59.3 KiB  [compared for emit]        [name: (main)]
main.b02d930c34bcde5f.0ed0b14f25767f82.main.js.map   298 KiB  [compared for emit] [dev]  [name: (main)]
 + 1 hidden asset
Entrypoint main [big] = main.b02d930c34bcde5f.0ed0b14f25767f82.main.js (63fe41824cb8236c0896a71b7df7f461.png main.b02d930c34bcde5f.0ed0b14f25767f82.main.js.map)
external "babel-polyfill" 42 bytes [built]
./index.js 271 bytes [built]
./demo-vue.vue 1.21 KiB [built]
../node_modules/vue/dist/vue.runtime.esm.js 222 KiB [built]
./demo-publicpath.js 95 bytes [built]
./demo-vue.vue?vue&type=template&id=47a7e22a&scoped=true& 212 bytes [built]
./demo-vue.vue?vue&type=script&lang=js& 258 bytes [built]
./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 824 bytes [built]
../node_modules/vue-loader/lib/runtime/componentNormalizer.js 2.71 KiB [built]
../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=template&id=47a7e22a&scoped=true& 335 bytes [built]
../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=script&lang=js& 169 bytes [built]
../node_modules/style-loader/dist/cjs.js!../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src??ruleSet[0].rules[0].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 810 bytes [built]
../pub1.png?external 80 bytes [built]
../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js 6.64 KiB [built]
../node_modules/css-loader/dist/cjs.js!../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../node_modules/postcss-loader/src??ruleSet[0].rules[0].use[2]!../node_modules/sass-loader/dist/cjs.js!../node_modules/vue-loader/lib??vue-loader-options!./demo-vue.vue?vue&type=style&index=0&id=47a7e22a&lang=scss&scoped=true& 278 bytes [built]
    + 6 hidden modules

ERROR in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
This can impact web performance.
Assets: 
  main.b02d930c34bcde5f.0ed0b14f25767f82.main.js (258 KiB)

ERROR in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (1 KiB). This can impact web performance.
Entrypoints:
  main (258 KiB)
      main.b02d930c34bcde5f.0ed0b14f25767f82.main.js


ERROR in webpack performance recommendations: 
You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your application.
For more info visit https://webpack.js.org/guides/code-splitting/

192:webpack-demo yinqingyang$ 

```

ok，可以看到，直接提示我们报错了，说入口文件打包后最大限制是“1kb”。



👌，我们花了很多章节来介绍webpack的基础用法，其实webpack最主要的就是插件跟loader，后面我们实战一个项目然后具体分析一下用到的每个loader跟plugin，敬请期待！！



