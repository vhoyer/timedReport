let templateString = `
<div
    class="context-menu dropdown-menu"
    @click="$emit('close-self')"
    :class="{ show: isActive }"
    :style="{ transform: 'translate(' + x + 'px,' + y + 'px)' }"
    >
    <slot></slot>
</div>
`

Vue.component('context-menu',{
    template: templateString,
    props:{
        isActive: Boolean,
        x: Number,
        y: Number,
    },
})