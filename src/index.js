__webpack_public_path__ = "/";
import demoVue from "./demo-vue";
import Vue from "vue";
import "demo-publicpath";
const root=document.createElement("div");
root.id="app";
document.body.appendChild(root)
const app=new Vue({
    render:(h)=>h(demoVue)
});
app.$mount(root);