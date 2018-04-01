let vm = new Vue({
	el:"#app",
	data:{
		idOrigin: 0,
		isEditing: false,
		timer: {
			current: null,
			delay: 200,
		},
		cards: [],
	},
	methods:{
		getCardFromId: function(cardId){
			return this.cards.find(function(card){
				return card.id == cardId
			})
		},
		cardClicked: function (cardId){
			onTaskClick($(`#card-${cardId}`)[0])
		},
		addCard: function () {
			this.cards.push({
				id: this.idOrigin++,
				title: "Task description",
				project: "Project name",
				description: "Full description",
				time: 0,
				isSelected: false,
			})
		},
		removeCard: function(cardId){
			this.cards = this.cards.filter(function(element){
				return element.id !== cardId
			})
		},
		saveCookies: function () {
			console.log("TODO: save into cookies")
		},
		clearCookies: function () {
			Cookies.remove("vm-data")
			this.cards = []
		},
	},
});

function onTaskClick(card){
	console.log("TODO: change method of getting id")
	if (vm.isEditing){
		return;
	}


	if (card.classList.contains("selected")){
		stopTimerOn(card.id.replace("card-",""));
		return;
	}

	let selection = document.querySelector(".selected");
	if (selection != null){
		stopTimerOn(selection.id.replace("card-",""));
	}

	startTimerOn(card.id.replace("card-",""));
}
function stopTimerOn(cardId){
	vm.getCardFromId(cardId).isSelected = false

	clearInterval(vm.timer.current);
}
function startTimerOn(cardId){
	vm.getCardFromId(cardId).isSelected = true

	vm.timer.current = setInterval(function(){
		vm.getCardFromId(cardId).time += vm.timer.delay
	},vm.timer.delay)
}

function ifEditingTime(field){
	let card = field.parentNode;

	if(card.classList.contains("selected")){ 
		stopTimerOn(card);
	}

	return {
		wasTimer: field.classList.contains("timer"),
		wasRunning: !card.classList.contains("selected")
	};
}

function editField(field){
	let card = field.parentNode;
	let timer = ifEditingTime(field);

	let outOfFocusBehaviour = function(){
		isEditing = false;
		field.setAttribute("contenteditable","false");

		//if it was editingand has a valid time string
		if (timer.wasTimer && field.innerHTML.match(/\d\d:\d\d:\d\d/) != null){
			field.dataset.time = new Date(`1970-01-01T${field.innerHTML}`).getTime()-timeOffset();
		}
		if (timer.wasTimer && timer.wasRunning){
			startTimerOn(card);
			//was triggering outOfFocusBehaviour multiple times, thisis a workaround
			timer.wasTimer = false;
		}
	}

	vm.isEditing = true;
	field.setAttribute("contenteditable","true");
	field.focus();
	document.execCommand('selectAll',false,null);

	$(field).on('blur',function(){
		outOfFocusBehaviour();
	});
	$(field).on('keydown',function(e){
		if (e.key != "Enter"){
			return;
		}
		outOfFocusBehaviour();
		e.preventDefault();
	});
}