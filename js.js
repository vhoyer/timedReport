let autoSaver;

let vm = new Vue({
	el:"#app",
	data:{
		displayNotCookieAlert: true,
		beta: false,
		configEntry: "",

		isEditing: false,

		timer: {
			startCounting: 0,
			current: null,
			delay: 200,
		},

		idOrigin: 0,
		cards: [],

		taskStateCustom:[
			{ index: 3, percentage: 100, color:"var(--success)", },
		],
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

		customActions: [
			{
				name: "Now with custom actions",
				action: "(function(){vm.showConfigModal();vm.configEntry=\"vm.customActions[0]=({\\n    name: 'Increment It!',\\n    action: '( function(){\\\\\\n    let card=vm.getCardFromId(vm.context.cardId);\\\\\\n    if( card.percentage == 0 ) { card.taskState = 1; }\\\\\\n    if( card.percentage == 100 ) { return; }\\\\\\n    let n = vm.incrementWithRandom(card);\\\\\\n    if( n == 100 ) { card.taskState = 3; }\\\\\\n    card.percentage=n;\\\\\\n})'});\";setTimeout(()=>{autosize.update(document.querySelector('#config-entry'))},0)})"
			},
		],
	},
	computed:{
		storage: function(){
			return {
				displayNotCookieAlert: this.displayNotCookieAlert,
				taskStateCustom: this.taskStateCustom,
				customActions: this.customActions,
				configEntry: this.configEntry,
				taskStates: this.taskStates,
				idOrigin: this.idOrigin,
				cards: this.cards,
				beta: this.beta,
			}
		}
	},
	mounted: function(){
		this.loadStorage()
		autoSaver = setInterval(
			() => this.saveStorage()
		,this.timer.delay)
	},
	methods:{
		getCardFromId: function(cardId){
			return this.cards.find(function(card){
				return card.id == cardId
			})
		},



		getProgressColor: function(card){
			let color = this.taskStateCustom

			let matchingTaskState = element => element.index === card.taskState
			let _new = this.taskStateCustom.find(matchingTaskState)
			if (_new === undefined){ return "" }

			return _new.color;
		},
		getStateString: function(card){
			return this.taskStates[card.taskState];
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



		getRandomPercentage:function(){
			return Math.floor(
				Math.random() * 100
			)
		},
		incrementWithRandom:function(card){
			let increment = Math.floor( Math.random() * 10 )
			let newValue = increment + card.percentage
			if (newValue > 100){
				newValue = 100
			}
			return newValue
		},



		addCard: function () {
			this.cards.push({
				id: `card-${this.idOrigin++}`,
				title: "Task description",
				project: "Project name",
				description: "Full description",
				time: 0,
				taskState: 0,
				percentage: 0,
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



		saveStorage: function () {
			window.localStorage.setItem("vm-data",
				JSON.stringify(this.storage))
		},
		loadStorage: function () {
			let raw = window.localStorage.getItem("vm-data")
			if (raw === null || raw === "undefined") {
				return
			}

			let load = JSON.parse(raw)

			if (load.displayNotCookieAlert !== undefined) {
				this.displayNotCookieAlert = load.displayNotCookieAlert
			}
			if (load.taskStateCustom !== undefined){
				this.taskStateCustom = load.taskStateCustom
			}
			if (load.customActions !== undefined){
				this.customActions = load.customActions
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
			if (load.configEntry !== undefined){
				this.configEntry = load.configEntry
			}
			//backward support
			if (load.taskStatePercentage !== undefined){
				this.taskStateCustom = load.taskStatePercentage
			}
		},
		clearStorage: function () {
			clearInterval(this.timer.current)
			clearInterval(autoSaver)

			this.displayCookieAlert = true
			this.timer.current = null
			this.beta = false
			this.clearCards()

			window.localStorage.clear()
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

			let matchingTaskState = element => element.index === statesIndex
			let _new = this.taskStateCustom.find(matchingTaskState)
			if (_new === undefined){ return }

			let callIt = typeof _new.percentage === "string"
			card.percentage = callIt ? eval(_new.percentage)(card) : _new.percentage
		},
		checkTaskState: function(taskIndex){
			let card = this.getCardFromId(this.context.cardId)
			if (card === undefined) { return }

			return card.taskState === taskIndex
		},
		showPercentageOption: function(){
			let card = this.getCardFromId(this.context.cardId)
			if (card === undefined) { return }

			let matchingTaskState = element => element.index === card.taskState
			let hasMatchingPercentage = this.taskStateCustom.find(matchingTaskState) !== undefined

			return !hasMatchingPercentage
		},
		changePercentage: function(){
			let card = this.getCardFromId(this.context.cardId)
			let newValue = prompt("Change task percentage:", card.percentage)

			//convert to Number
			newValue = Number( newValue )

			if (newValue === NaN) { return }

			card.percentage = newValue
		},



		convertToFunction:function(string){
			return eval(string)
		},



		showConfigModal:function(){
			let modal = $('#config-modal')
			modal.on('shown.bs.modal', function () {
				let textarea = $('#config-entry')
				textarea.trigger('focus')

				autosize(textarea)
				textarea.on('autosize:resized', function () {
					modal.modal('handleUpdate')					
				})
			})
			modal.modal('show')
		},
		saveConfigFile:function(){
			let sourceText = vm.configEntry, fileIdentity = "MyTimedReport.config.js";
			let workElement = document.createElement("a")
			if ('download' in workElement) {
				workElement.href = "data:" + 'text/plain' + "charset=utf-8," + escape(sourceText)
				workElement.setAttribute("download", fileIdentity)
				document.body.appendChild(workElement)
				let eventMouse = document.createEvent("MouseEvents")
				eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
				workElement.dispatchEvent(eventMouse)
				document.body.removeChild(workElement)
			} else throw 'File saving not supported for this browser'
		},
		runConfig:function(){
			eval(this.configEntry)
		},



		excelBase: function(card){
			let time = time => new Date(time + timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/)[0]
			let stateString = this.taskStates[card.taskState]

			//removing line breaks
			card.title       = card.title      .replace(/\n/g," ")
			card.project     = card.project    .replace(/\n/g," ")
			card.description = card.description.replace(/\n/g," ")

			return `${card.project}\t${card.title}\t${card.description}\t${stateString}\t\t${card.percentage}%\t\t${time(card.time)}\n`
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

	//Check if browser have support for window.localStorage
	if (!storageAvailable('localStorage')){
		alert("Please Update yout browser for a better experience")
	}
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



function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}