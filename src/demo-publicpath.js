import "./assets/polyfill";
export const say = () => {
    document.body.append(document.createTextNode("hello webpack"))
}