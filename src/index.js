__webpack_public_path__ = "http://localhost:8091/webpack-demo/lib/";
import demoVue from "./demo-vue";
import Vue from "vue";
import "demo-publicpath";
new Vue({
    el: "#app",
    render:(h)=>h(demoVue)
});