__webpack_public_path__ = "http://localhost:8080/webpack-demo/lib/";
export default function demoSay() {
    import("./demo-publicpath").then((demoPublicPath) => {
        demoPublicPath.say();
    });
}