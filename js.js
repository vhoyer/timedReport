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

		//event args
		ev: {
			previousActiveCard: null,
			senderCard: null,
		},
		on: {
			cardCliking: "()=>{}",
			cardClicked: "()=>{}",
		},
	},
	computed:{
		storage() {
			return {
				displayNotCookieAlert: this.displayNotCookieAlert,
				taskStateCustom: this.taskStateCustom,
				customActions: this.customActions,
				configEntry: this.configEntry,
				taskStates: this.taskStates,
				idOrigin: this.idOrigin,
				timer: this.timer,
				cards: this.cards,
				beta: this.beta,
			}
		},
	},
	mounted() {
		this.loadStorage()
		//Run config when start
		Vue.nextTick()
			.then(() => eval(this.configEntry))
		//Start auto save timer
		autoSaver = setInterval(
			() => this.saveStorage()
		,this.timer.delay)
	},
	methods: {
		getCardFromId(cardId) {
			return this.cards.find(function(card){
				return card.id == cardId
			})
		},



		getProgressColor(card) {
			let matchingTaskState = element => element.index === card.taskState
			let _new = this.taskStateCustom.find(matchingTaskState)
			if (_new === undefined){ return "" }

			return _new.color;
		},
		getStateString(card) {
			return this.taskStates[card.taskState];
		},



		cardClicked(cardId) {
			this.ev.senderCard = vm.getCardFromId(cardId)

			this.call(this.on.cardCliking, this.ev)

			if (this.isEditing) {
				return
			}

			if (this.ev.senderCard.isSelected) {
				stopTimerOn(cardId)
				return
			}

			startTimerOn(cardId)

			this.call(this.on.cardClicked, this.ev)
		},
		editField(field, cardId) {
			editField(field, /*then*/ () => {
				let property = field.dataset.boundProperty
				if (property === undefined){
					return
				}

				this.getCardFromId(cardId)[property] = field.innerHTML.trim()
			})
		},



		getRandomPercentage() {
			return Math.floor(
				Math.random() * 100
			)
		},
		incrementWithRandom(card) {
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
				//estimated time of completion
				eta: 0,
				taskState: 0,
				percentage: 0,
				isSelected: false,
				isHidden: false,
			})
		},
		removeCard(cardId) {
			this.cards = this.cards.filter(function(element){
				return element.id !== cardId
			})
		},
		clearCards() {
			clearInterval(this.timer.current)
			this.idOrigin = 0
			this.cards = []
		},



		saveStorage() {
			window.localStorage.setItem("vm-data",
				JSON.stringify(this.storage))
		},
		loadStorage() {
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
			if (load.timer !== undefined) {
				this.timer = load.timer
			}
			if (load.cards !== undefined) {
				//backward compatibility
				load.cards.forEach(e =>{
					if (e.eac !== undefined && e.eta == undefined){
						e.eta = e.eac
						delete e.eac
					}
					else if (e.eta == undefined){
						e.eta = 0
					}
				})
				this.cards = load.cards
			}
			if (load.beta !== undefined) {
				this.beta = load.beta
			}
			if (load.configEntry !== undefined){
				this.configEntry = load.configEntry
			}
		},
		clearStorage() {
			clearInterval(this.timer.current)
			clearInterval(autoSaver)

			this.displayCookieAlert = true
			this.timer.current = null
			this.beta = false
			this.clearCards()

			window.localStorage.clear()
		},



		contextmenu(event, cardId) {
			if (this.isEditing){
				return
			}

			event.preventDefault()

			this.context.x = event.x
			this.context.y = event.y
			this.context.isActive = true
			this.context.cardId = cardId
		},
		closeContextMenu() {
			vm.context.isActive = false
		},
		switchCardState(statesIndex) {
			let card = this.getCardFromId(this.context.cardId)
			card.taskState = statesIndex

			let matchingTaskState = element => element.index === statesIndex
			let _new = this.taskStateCustom.find(matchingTaskState)
			if (_new === undefined){ return }

			let callIt = typeof _new.percentage === "string"
			card.percentage = callIt ? eval(_new.percentage)(card) : _new.percentage
		},
		checkTaskState(taskIndex) {
			let card = this.getCardFromId(this.context.cardId)
			if (card === undefined) { return }

			return card.taskState === taskIndex
		},
		showPercentageOption() {
			let card = this.getCardFromId(this.context.cardId)
			if (card === undefined) { return }

			let matchingTaskState = element => element.index === card.taskState
			let hasMatchingPercentage = this.taskStateCustom.find(matchingTaskState) !== undefined

			return !hasMatchingPercentage
		},
		changePercentage() {
			let card = this.getCardFromId(this.context.cardId)
			let newValue = prompt("Change task percentage:", card.percentage)

			//convert to Number
			newValue = Number( newValue )

			if (newValue === NaN) { return }

			card.percentage = newValue
		},



		call(code, handler) {
			eval(`(${code})`)(handler)
		},



		showConfigModal() {
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
		saveConfigFile() {
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
		runConfig() {
			eval(this.configEntry)

			document.querySelector("#config-modal button.btn.d-none.d-sm-block").click()
		},



		excelBase(card) {
			let time = time => (time > 0 ? "" : "-") + new Date( (time > 0 ? 1 : -1) * time + timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/)[0]
			let stateString = this.taskStates[card.taskState]

			//removing line breaks
			card.title       = card.title      .replace(/\n/g," ")
			card.project     = card.project    .replace(/\n/g," ")
			card.description = card.description.replace(/\n/g," ")

			return `${card.project}\t${card.title}\t${card.description}\t${stateString}\t\t${card.percentage}%\t\t${time(card.time)}\t${time(card.eta - card.time)}\n`
		},
		toExcel() {
			let card = this.getCardFromId(this.context.cardId)
			let excel = this.excelBase(card)
			copy(excel)
		},
		exportToExcel() {
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
		startTimerOn(selection.id, false);
	}

	window.addEventListener("keydown", function onPress(event) {
		if (event.key !== "Escape") { return }

		vm.closeContextMenu()
	});

	//Check if browser have support for window.localStorage
	if (!storageAvailable('localStorage')){
		alert("Please Update yout browser for a better experience, I haven't tested with an outdated browser, so you may have no expirience at all xD\n\nHey, I'm doing you a favor")
	}
})

function stopTimerOn(cardId){
	vm.getCardFromId(cardId).isSelected = false

	clearInterval(vm.timer.current)
}
function startTimerOn(cardId, updateNowValue = true){
	let selection = document.querySelector(".selected");
	if (selection != null) {
		//stop any running timer
		stopTimerOn(selection.id)
		//set the events properties
		vm.ev.previousActiveCard = vm.getCardFromId(selection.id)
	}

	vm.getCardFromId(cardId).isSelected = true

	if (updateNowValue) {
		vm.timer.startCounting = Date.now()
	}

	vm.timer.current = setInterval(function(){
		let now = Date.now()
		vm.getCardFromId(cardId).time += (now - vm.timer.startCounting)

		vm.timer.startCounting = now
	},vm.timer.delay)
}

function ifEditingTime(field){
	let card = field.parentNode
	let isEta = field.classList.contains("eta")

	if(card.classList.contains("selected") && !isEta){
		//because if editing title..description the parentNode == card-body
		stopTimerOn(card.id)
	}

	return {
		wasEta: isEta,
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
		if (timer.wasTimer || timer.wasEta){
			cardId = field.parentNode.id
			timeString = field.innerHTML.match(/\d\d:\d\d:\d\d/)
		}
		//if it was editing and has a valid time string
		if (timer.wasTimer && timeString != null){
			vm.getCardFromId(cardId).time = new Date(`1970-01-01T${timeString}`).getTime()-timeOffset()
		}
		if (timer.wasEta && timeString != null){
			vm.getCardFromId(cardId).eta = new Date(`1970-01-01T${timeString}`).getTime()-timeOffset()
		}
		if (timer.wasTimer && timer.wasRunning){
			startTimerOn(cardId)
			//was triggering outOfFocusBehaviour multiple times, this is a workaround
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
            x = '__storage_test__'
        storage.setItem(x, x)
        storage.removeItem(x)
        return true
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
            storage.length !== 0
    }
}

function loadFileToConfig(files){
	let file = files[0]
	if (file == null) {
		return
	}

	var reader = new FileReader()
	reader.readAsText(file, "UTF-8")
	reader.onload = function (evt) {
		vm.configEntry = evt.target.result
	}
	reader.onerror = function (_evt) {
		alert("Couldn't load file's content")
	}
}
