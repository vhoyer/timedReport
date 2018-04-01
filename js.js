let vm = new Vue({
	el:"#app",
	data:{
		isEditing: false,
		timer: {
			current: null,
			delay: 200,
		},
		cards: [
			{
				title: "Task description",
				project: "Project name",
				description: "Full description",
				time: 10000,
				isSelected: false,
			},
		],
	},
	methods:{
		addCard: function () {
			this.cards.push({
				title: "Task description",
				project: "Project name",
				description: "Full description",
				time: 0,
				isSelected: false,
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
	if (vm.isEditing){
		return;
	}


	if (card.classList.contains("selected")){
		stopTimerOn(card);
		return;
	}

	let selection = document.querySelector(".selected");
	if (selection != null){
		stopTimerOn(selection);
	}

	startTimerOn(card);
}
function stopTimerOn(card){
	card.classList.remove("selected");
	clearInterval(vm.timer.current);
}
function timeOffset(){
	return new Date(0).getTimezoneOffset() * 60000;
}
function startTimerOn(card){
	card.classList.add("selected");

	let thisTimer = card.querySelector(".timer");
	let starterTime = Number(thisTimer.dataset.time);

	vm.timer.current = setInterval(function(){
		starterTime += vm.timer.delay;
		thisTimer.dataset.time = starterTime;

		thisTimer.innerHTML = new Date(starterTime + timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/);
	},vm.timer.delay);
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

function closeCard(btnClose){
	btnClose.parentNode.parentNode.parentNode.remove();
}