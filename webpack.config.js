const path = require("path");
module.exports = {
    mode: "development",
    target: "web",
    context: path.resolve(__dirname, "./src"),
    // entry: "./index.js",//默认配置,
    // entry: ['./index.js'],//默认配置,
    // entry: {
    //   main: "./index.js"
    // },//默认配置,
    // entry: () => ["./index.js"]//默认配置,
    entry: () => new Promise((resolve)=>{
        resolve({
            main: "./index.js?query=111"
        });
    }),
    output: {
        filename:  "[name].[hash:8].[id].js",
        chunkFilename: "[name].js",
        path: path.resolve(__dirname,"dist11"),
        publicPath: "./dist11/",
        auxiliaryComment: "Test Comment",
        library: "demo1",
        libraryTarget: "jsonp1",
    }
}