let cardTemplate = `
    <div class="mb-4 col-12 col-sm-6 col-md-4 col-lg-3">
        <div
            class="card text-center h-100"
            v-bind:id=" HTMLCardId "
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
                    data-bound-property="title"
                    v-on:click="cardClickedOr('edit-title', 'card-title')" >
                    {{ title }}
                </div>
                <div
                    class="card-subtitle mb-2 text-muted"
                    data-bound-property="project"
                    v-on:click="cardClickedOr('edit-project', 'card-subtitle')" >
                    {{ project }}
                </div>
                <p
                    class="card-text"
                    data-bound-property="description"
                    v-on:click="cardClickedOr('edit-description', 'card-text')" >
                    {{ description }}
                </p>
            </div>
            <div
                class="card-footer timer"
                v-bind:data-time="time"
                v-on:click="cardClickedOr('edit-time', 'timer')" >
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
            HTMLCardId: this.$vnode.key,
            delay: 200,
            clicks: 0,
            timer: null
        } 
    },
    methods: {
        cardClickedOr: function (eventName, field) {
            this.clicks++

            if (this.clicks === 1) {
                let self = this

                this.timer = setTimeout(function () {
                    self.$emit('card-clicked')
                    self.clicks = 0
                }, this.delay)
            } else {
                clearTimeout(this.timer)

                let elementToEdit = $(`#${this.HTMLCardId} .${field}`)[0]

                this.$emit(eventName, elementToEdit)
                this.clicks = 0
            }        	
      }      
    },
})

function timeOffset(){
	return new Date(0).getTimezoneOffset() * 60000;
}