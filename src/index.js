__webpack_public_path__ = "/";
import Vue from "vue";
import "demo-publicpath";
const root=document.createElement("div");
root.id="app";
document.body.appendChild(root)
const app=new Vue({
    el: "#app",
    components:{
      "demo-view":()=>import("./demo-vue")
    },
    render:(h)=>h("demo-view")
});