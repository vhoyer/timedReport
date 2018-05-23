let cardTemplate = `
    <div class="mb-4 col-12 col-sm-6 col-md-4 col-lg-3">
        <div
            class="card text-center h-100"
            @contextmenu="$emit('contextmenu', $event)"
            :id=" HTMLCardId "
            :class="{ selected: isSelected }">
            <div class="close-wrapper">
                <button
                    type="button"
                    class="close close-card"
                    aria-label="Close"
                    @click="$emit('card-closed')" >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div
                class="card-header etc"
                v-html="etcString"
                @click="cardClickedOr('edit-etc', 'etc')" >
            </div>
            <div class="card-body d-flex flex-column" @click.self="$emit('card-clicked')">
                <div
                    class="card-title h5"
                    data-bound-property="title"
                    @click="cardClickedOr('edit-title', 'card-title')" >
                    {{ title }}
                </div>
                <div
                    class="card-subtitle mb-2 text-muted"
                    data-bound-property="project"
                    @click="cardClickedOr('edit-project', 'card-subtitle')" >
                    {{ project }}
                </div>
                <p
                    class="card-text"
                    style="flex-grow:inherit"
                    data-bound-property="description"
                    @click="cardClickedOr('edit-description', 'card-text')" >
                    {{ description }}
                </p>
                <div class="progress my-2" style="height: 2px;">
                    <div
                        class="progress-bar bg-secondary"
                        role="progressbar"
                        :style="{ width: progress+'%', 'background-color': progressColorCss }"
                        :aria-valuenow="progress"
                        aria-valuemin="0"
                        aria-valuemax="100">
                    </div>
                </div>
                <div
                    class="card-status"
                    @click="$emit('card-clicked')"
                    >
                    {{ taskStateString }}
                </div>
            </div>
            <div
                class="card-footer timer"
                v-html="timeString"
                @click="cardClickedOr('edit-time', 'timer')" >
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

        progressColor: String,
        progress: Number,
        taskStateString: String,
        
        time: Number,
        etc: Number,

        isSelected: Boolean,
        isEditing: Boolean,
    },
    computed: {
        timeString: function() {
            return new Date(this.time + timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/)[0]
        },
        etcString: function() {
            return new Date(this.etc + timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/)[0]
        },
        progressColorCss: function(){
            if (this.progressColor == undefined){ return }

            return this.progressColor + '!important'
        },
    },
    data() {
        return {
            HTMLCardId: this.$vnode.key,
            delay: 200,
            clicks: 0,
            timer: null
        } 
    },
    mounted:function(){
        let card = document.querySelector(`#${this.HTMLCardId}`)

        let elements =
        [ card.querySelector(".card-title")
        , card.querySelector(".card-subtitle")
        , card.querySelector(".card-text")
        ]
        
        elements.forEach(element => {
            element.addEventListener("paste", this.pastePureText)
        });
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
        },      
        pastePureText: function (e) {
            e.preventDefault();
            var text = e.clipboardData.getData("text/plain");
            var temp = document.createElement("div");
            temp.innerHTML = text;
            document.execCommand("insertHTML", false, temp.textContent);
        },
    },
})

function timeOffset(){
	return new Date(0).getTimezoneOffset() * 60000;
}