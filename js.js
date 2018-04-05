let autoSaver;

let vm = new Vue({
	el:"#app",
	data:{
		displayCookieAlert: true,
		beta: false,

		idOrigin: 0,
		isEditing: false,
		timer: {
			startCounting: 0,
			current: null,
			delay: 200,
		},
		cards: [],
		taskStates: [
			"todo",
			"doing",
			"paused",
			"done",
		],

		context: {
			isActive: false,
			cardId: "",
			x: 0,
			y: 0,
		},
	},
	computed:{
		cookies: function(){
			return {
				displayCookieAlert: this.displayCookieAlert,
				taskStates: this.taskStates,
				idOrigin: this.idOrigin,
				cards: this.cards,
				beta: this.beta,
			}
		}
	},
	mounted: function(){
		this.loadCookies()
		autoSaver = setInterval(
			() => this.saveCookies()
		,this.timer.delay)
	},
	methods:{
		getCardFromId: function(cardId){
			return this.cards.find(function(card){
				return card.id == cardId
			})
		},



		cardClicked: function (cardId) {
			if (vm.isEditing) {
				return;
			}

			if (vm.getCardFromId(cardId).isSelected) {
				stopTimerOn(cardId);
				return;
			}

			startTimerOn(cardId);
		},
		editField: function(field, cardId){
			editField(field, /*then*/ () => {
				let property = field.dataset.boundProperty
				if (property === undefined){
					return
				}

				this.getCardFromId(cardId)[property] = field.innerHTML.trim()
			})
		},



		addCard: function () {
			this.cards.push({
				id: `card-${this.idOrigin++}`,
				title: "Task description",
				project: "Project name",
				description: "Full description",
				time: 0,
				taskState: 0,
				isSelected: false,
			})
		},
		removeCard: function(cardId){
			this.cards = this.cards.filter(function(element){
				return element.id !== cardId
			})
		},
		clearCards: function (){
			clearInterval(this.timer.current)
			this.idOrigin = 0
			this.cards = []
		},



		saveCookies: function () {
			Cookies.set("vm-data", this.cookies, { expires: 365 /*days*/ })
		},
		loadCookies: function () {
			let raw = Cookies.get("vm-data")
			if (raw === undefined) {
				return
			}

			let load = JSON.parse(raw)

			if (load.displayCookieAlert !== undefined) {
				this.displayCookieAlert = load.displayCookieAlert
			}
			if (load.taskStates !== undefined) {
				this.taskStates = load.taskStates
			}
			if (load.idOrigin !== undefined) {
				this.idOrigin = load.idOrigin
			}
			if (load.cards !== undefined) {
				this.cards = load.cards
			}
			if (load.beta !== undefined) {
				this.beta = load.beta
			}
		},
		clearCookies: function () {
			clearInterval(this.timer.current)
			clearInterval(autoSaver)

			this.displayCookieAlert = true
			this.timer.current = null
			this.beta = false
			this.clearCards()

			Cookies.remove("vm-data")
		},



		contextmenu: function(event, cardId){
			if (this.isEditing){
				return
			}

			event.preventDefault()

			this.context.x = event.x
			this.context.y = event.y
			this.context.isActive = true
			this.context.cardId = cardId
		},
		closeContextMenu: function(){
			vm.context.isActive = false
		},
		switchCardState: function(statesIndex){
			let card = this.getCardFromId(this.context.cardId)
			card.taskState = statesIndex
		},



		excelBase: function(card){
			let time = time => new Date(time + timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/)[0]
			let stateString = this.taskStates[card.taskState]

			return `${card.project}\t${card.title}\t${card.description}\t${stateString}\t\t\t\t${time(card.time)}\n`
		},
		toExcel: function(){
			let card = this.getCardFromId(this.context.cardId)
			let excel = this.excelBase(card)
			copy(excel)
		},
		exportToExcel: function(){
			let excel = ""
			this.cards.forEach(card => {
				excel += this.excelBase(card)
			})
			copy(excel)
		},
	},
});

$(document).ready(function(){
	let selection = document.querySelector(".selected");
	if (selection != null) {
		//restart any selected card's timer
		startTimerOn(selection.id);
	}

	window.addEventListener("keydown", function onPress(event) {
		if (event.key !== "Escape") { return }

		vm.closeContextMenu()
	});
})

function stopTimerOn(cardId){
	vm.getCardFromId(cardId).isSelected = false

	clearInterval(vm.timer.current)
}
function startTimerOn(cardId){
	let selection = document.querySelector(".selected");
	if (selection != null) {
		//stop any running timer
		stopTimerOn(selection.id);
	}

	vm.getCardFromId(cardId).isSelected = true

	vm.timer.startCounting = Date.now()
	vm.timer.current = setInterval(function(){
		let now = Date.now()
		vm.getCardFromId(cardId).time += (now - vm.timer.startCounting)

		vm.timer.startCounting = now
	},vm.timer.delay)
}

function ifEditingTime(field){
	let card = field.parentNode

	if(card.classList.contains("selected")){ 
		stopTimerOn(card.id)
	}

	return {
		wasTimer: field.classList.contains("timer"),
		wasRunning: card.classList.contains("selected")
	}
}

function editField(field, callback){
	let timer = ifEditingTime(field)

	let outOfFocusBehaviour = function(){
		vm.isEditing = false;
		field.setAttribute("contenteditable","false")

		callback()

		let cardId;
		let timeString;
		if (timer.wasTimer){
			cardId = field.parentNode.id
			timeString = field.innerHTML.match(/\d\d:\d\d:\d\d/)
		}
		//if it was editingand has a valid time string
		if (timer.wasTimer && timeString != null){
			vm.getCardFromId(cardId).time = new Date(`1970-01-01T${timeString}`).getTime()-timeOffset()
		}
		if (timer.wasTimer && timer.wasRunning){
			startTimerOn(cardId)
			//was triggering outOfFocusBehaviour multiple times, thisis a workaround
			timer.wasTimer = false
		}
	}

	vm.isEditing = true
	field.setAttribute("contenteditable","true")
	field.focus()
	document.execCommand('selectAll',false,null)

	$(field).on('blur',function(){
		outOfFocusBehaviour()
	})
	$(field).on('keydown',function(e){
		if (e.key != "Enter"){
			return
		}
		outOfFocusBehaviour()
		e.preventDefault()
	})
}

function setupClipboard(text){
	$("body").append(`<div id="clipboard-container" style="
	position: fixed;
	left: 0px;
	top: 0px;
	width: 0px;
	height: 0px;
	z-index: 100;
	opacity: 0;"><textarea id="clipboard" style="
	width: 1px;
	height: 1px;       
	padding: 0px;">${text}</textarea></div>`)
}
function setoffClipboard(){
	$('#clipboard-container').remove()
}
function copy(text) {
	setupClipboard(text)

	//Get Input Element
	document.getElementById("clipboard").select()

	//Copy Content
	document.execCommand("copy")

	setoffClipboard()
}