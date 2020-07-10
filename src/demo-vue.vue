<template>
<div class="demo-vue">
    hello fox1
    <img :src="pubImg">
</div>
</template>

<script>
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
	color: red;
}
</style>
