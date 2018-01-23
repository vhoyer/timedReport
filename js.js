let report;
let currentTimer;
let isEditing = false;

$(document).ready(function(){
	$("#add-new").on("click",function(){
		$("#container").append(`
			<div class="mb-2 col-12 col-sm-4 col-lg-3">
				<div class="card text-center h-100" onclick="onTaskClick(this)">
					<div class="close-wrapper">
						<button type="button" class="close close-card" aria-label="Close" onclick="closeCard(this)">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="card-body">
						<div class="card-title h5" ondblclick="editField(this)">Task description</div>
						<div class="card-subtitle mb-2 text-muted" ondblclick="editField(this)">Project name</div>
						<p class="card-text" ondblclick="editField(this)">Full description</p>
					</div>
					<div class="card-footer timer" data-time="0" ondblclick="editField(this)">00:00:00</div>
				</div>
			</div>
		`);
	});
});

function onTaskClick(card){
	if (isEditing){
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
	clearInterval(currentTimer);
}
function timeOffset(){
	return new Date(0).getTimezoneOffset() * 60000;
}
function startTimerOn(card){
	card.classList.add("selected");

	let thisTimer = card.querySelector(".timer");
	let starterTime = Number(thisTimer.dataset.time);

	currentTimer = setInterval(function(){
		starterTime += 1000;
		thisTimer.dataset.time = starterTime;

		thisTimer.innerHTML = new Date(starterTime + timeOffset()).toTimeString().match(/\d\d:\d\d:\d\d/);
	},1000);
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

	isEditing = true;
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
