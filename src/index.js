__webpack_public_path__ = "/";
import Vue from "vue";
import "demo-publicpath";
const root=document.createElement("div");
root.id="app";
document.body.appendChild(root)
const app=new Vue({
    render:(h)=>h(import("./demo-vue"))
});
const app1=new Vue({
    render:(h)=>h(import("./demo-vue2"))
});
app.$mount(root);
app1.$mount(root);