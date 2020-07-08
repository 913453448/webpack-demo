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
        noParse: /babel-polyfill/,
        rules: [
            {
                test: /.vue$/,
                use: 'vue-loader',
            },
            {
                resource: {
                    test: /\.fox/i,
                    exclude: /node_modules/
                },
                issuer: {
                    test: /\.js$/i,
                    exclude: /node_modules/
                },
                use: 'vue-loader',
            }
        ]
    },
    plugins: [
        new (require("vue-loader-plugin"))()
    ]
};