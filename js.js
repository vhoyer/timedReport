let report;
let currentTimer;
$(document).ready(function(){
	$("#add-new").on("click",function(){
		$("#container").append(`
			<div class="mb-2 col-6 col-sm-4 col-lg-3">
				<div class="card text-center h-100" onclick="onTaskClick(this)">
					<div class="card-body">
						<div class="card-title h5" ondblclick="editField(this)">Task description</div>
						<div class="card-subtitle mb-2 text-muted" ondblclick="editField(this)">Project name</div>
						<p class="card-text" ondblclick="editField(this)">Full description</p>
					</div>
					<div class="card-footer timer" data-time="0">00:00:00</div>
				</div>
			</div>
		`);
	});
});

function onTaskClick(card){
	if (card.classList.contains("selected")){
		card.classList.remove("selected");
		clearInterval(currentTimer);
		return;
	}

	let selection = document.querySelector(".selected");
	if (selection != null){
		selection.classList.remove("selected");
		clearInterval(currentTimer);
	}

	card.classList.add("selected");
	startTimerOn(card);
}
function startTimerOn(card){
	let thisTimer = card.querySelector(".timer");
	let starterTime = Number(thisTimer.dataset.time);

	currentTimer = setInterval(function(){
		starterTime += 1000;
		thisTimer.dataset.time = starterTime;

		thisTimer.innerHTML = new Date(starterTime + new Date(0).getTimezoneOffset() * 60000).toTimeString().match(/\d\d:\d\d:\d\d/);
	},1000);
}

function editField(field){
	field.setAttribute("contenteditable","true");
	field.focus();
	document.execCommand('selectAll',false,null);
	$(field).on('keydown',function(e){
		if (e.key != "Enter"){
			return;
		}
		field.setAttribute("contenteditable","false");
		e.preventDefault();
	});
}
