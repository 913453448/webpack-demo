const {
    minify: terserMinify
} = require('terser');
const fs = require("fs");
const path = require("path");
const file = "app.0ebefcd962170615.bf5359b2e366b637.143.js";
const input = fs.readFileSync(path.resolve(__dirname, "../lib/" + file),"utf-8");
const output = path.resolve(__dirname, "./result.js");

const result = terserMinify({
    [file]: input
}, {
    ecma: 6,
    warnings:void 0,
    parse: {},
    compress: {
        drop_console: true,
        inline: true,

    },
    mangle: {
        toplevel: true
    },
    output: {
        beautify: false,
        comments: false,
        inline_script: true
    },
    module: false,
    sourceMap: null,
    toplevel: true,
    nameCache: void 0,
    ie8: void 0,
    keep_classnames: void 0,
    keep_fnames: void 0,
    safari10: void 0,
});
fs.writeFileSync(output,result.code,{encoding: "utf-8"});
console.log(result)