__webpack_public_path__ = "http://localhost:8091/webpack-demo/lib/";
import demoVue from "./demo-vue.fox";
console.log(demoVue);
export default function demoSay() {
    import("./demo-publicpath").then((demoPublicPath) => {
        demoPublicPath.say();
    });
}