## 前言

前面我们写了几篇文章用来介绍webpack源码，跟着官网结合demo把整个webpack配置撸了一遍：

- [webpack源码解析一](https://vvbug.blog.csdn.net/article/details/103531670)
- [webpack源码解析二（html-webpack-plugin插件）](https://vvbug.blog.csdn.net/article/details/103571985)
- [webpack源码解析三](https://vvbug.blog.csdn.net/article/details/107233952)
- [webpack源码解析四](https://vvbug.blog.csdn.net/article/details/107300928)
- [webpack源码解析五](https://vvbug.blog.csdn.net/article/details/107303380)
- [webpack源码解析六（webpack-chain）](https://vvbug.blog.csdn.net/article/details/107319774)

今天我们结合demo来看一下webpack的[Optimization](https://webpack.js.org/configuration/optimization/)配置。

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
