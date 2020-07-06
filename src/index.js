/**
 *@author Yasin
 *@version [OCJ-ERP OCJ V01,2020/7/6]
 *@date 2020/7/6
 *@description
 */
    function hello() {
    import("./demo1").then((result)=>{
        new result.default().say();
    });
}
export default hello;