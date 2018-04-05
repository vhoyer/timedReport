let templateString = `
<div
    id="context-menu"
    class="context-menu dropdown-menu"
    :class="{ show: isActive }"
    :style="{ transform: 'translate(' + x + 'px,' + y + 'px)' }"
    >
    <slot></slot>
</div>
`

Vue.component('context-menu',{
    template: templateString,
    data(){return{
        width: 200,
        height: 200,
    }},
    props:{
        isActive: Boolean,
        x: Number,
        y: Number,
    },
    watch:{
        x:function(){
            let outsideScreen = window.innerWidth - 18 - (this.x + this.width)
            if (outsideScreen < 0){
                console.log(outsideScreen)
                this.$emit('outside-x', outsideScreen)
            }
        },
        y:function(){
            let outsideScreen = window.innerHeight - 18 - (this.y + this.height)
            if (outsideScreen < 0){
                console.log(outsideScreen)
                this.$emit('outside-y', outsideScreen)
            }
        },
    },
    mounted:function(){
        let menu = document.querySelector('#context-menu')

        let observer = new MutationObserver(mutations => {
            this.width = menu.offsetWidth
            this.height = menu.offsetHeight
        })

        observer.observe(menu, {
            attributes: true
        })
    },
})