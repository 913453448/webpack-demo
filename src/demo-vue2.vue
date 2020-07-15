<template>
<div class="demo-vue">
    <div class="item1"></div>
    <div class="item2"></div>
    <div class="item3"></div>
</div>
</template>

<script>
    import "babel-polyfill";
    export default {
        name: 'demo-vue',
        data(){
            return {
                pubImg: require("../pub1.png?external").default
            }
        }
    };
</script>
<style lang='scss' scoped>
.demo-vue{
	color: white;
    height: 100px;
    background: red;
    display: flex;
    > div{
    }
    .item1{
        width: 120px;
        background: green;
    }
    .item2{
        width: 200px;
        flex-grow: 1;
        flex-shrink: 1;
        background: blue;
    }
    .item3{
        width: 100px;
        flex-grow: 1;
        flex-shrink: 1;
        background: yellow;
    }
}
</style>
