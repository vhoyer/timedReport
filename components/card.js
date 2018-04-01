let cardTemplate = `
    <div class="mb-2 col-12 col-sm-4 col-lg-3">
        <div
            class="card text-center h-100"
            v-bind:id=" 'card-' + this.$vnode.key "
            v-bind:class="{ selected: isSelected }">
            <div class="close-wrapper">
                <button
                    type="button"
                    class="close close-card"
                    aria-label="Close"
                    v-on:click="$emit('card-closed')" >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="card-body" v-on:click.self="$emit('card-clicked')">
                <div
                    class="card-title h5"
                    v-on:click="cardClickedOr('edit-title')" >
                    {{ title }}
                </div>
                <div
                    class="card-subtitle mb-2 text-muted"
                    v-on:click="cardClickedOr('edit-project')" >
                    {{ project }}
                </div>
                <p
                    class="card-text"
                    v-on:click="cardClickedOr('edit-description')" >
                    {{ description }}
                </p>
            </div>
            <div
                class="card-footer timer"
                v-bind:data-time="time"
                v-on:click="cardClickedOr('edit-time')" >
                {{ timeString }}
            </div>
        </div>
    </div>
`
Vue.component('card',{
    template: cardTemplate,
    props:{
        title: String,
        project: String,
        description: String,
        time: Number,
        isSelected: Boolean,
    },
    computed: {
        timeString: function() {
            return new Date(this.time + timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/)[0]
        }
    },
    data() {
        return {
            delay: 200,
            clicks: 0,
            timer: null
        } 
    },
    methods: {
        cardClickedOr: function (eventName) {
            this.clicks++
            if (this.clicks === 1) {
                var self = this
                this.timer = setTimeout(function () {
                    self.$emit('card-clicked')
                    self.clicks = 0
                }, this.delay);
            } else {
                clearTimeout(this.timer);
                this.$emit(eventName);
                this.clicks = 0;
            }        	
      }      
    },
})
