const {
    minify: terserMinify
} = require('terser');
const fs = require("fs");
const path = require("path");
const file = "app.0af1167ea4856524.caf973a5594f8a64.app.js";
const input = fs.readFileSync(path.resolve(__dirname, "../lib/" + file),"utf-8");
const output = path.resolve(__dirname, "./result.js");

const result = terserMinify({
    [file]: input
}, {
    ecma: 6,
    warnings:void 0,
    parse: {},
    compress: {
        drop_console: true
    },
    mangle: true,
    output: {
        beautify: false,
        comments: false
    },
    module: false,
    sourceMap: null,
    toplevel: void 0,
    nameCache: void 0,
    ie8: void 0,
    keep_classnames: void 0,
    keep_fnames: void 0,
    safari10: void 0,
});
fs.writeFileSync(output,result.code,{encoding: "utf-8"});
console.log(result)