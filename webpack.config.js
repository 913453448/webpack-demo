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
    }
};