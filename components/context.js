let templateString = `
<div
    class="context-menu dropdown-menu"
    v-bind:class="{ show: isActive }"
    v-bind:style="{ transform: 'translate(' + x + 'px,' + y + 'px)' }"
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