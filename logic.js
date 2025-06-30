let loCells = [];
let loLeftCon = {};
let loAnswers = {};
let loColors = {};
let mistakesLeft = 0;
let wrongAnswers = [];

// Core Functionality
function load() {
	loCells = [];
	loLeftCon = structuredClone(nections);
	mistakesLeft = 0;
	loAnswers = {};
	wrongAnswers = [];
	priorityCons = [];

	for (let i = 0; i < 4; i++) {
		let category = null;
		let subcategory = null;
		if (priorityCons.length > 0) {
			const randomCategory = priorityCons[ priorityCons.length * Math.random() << 0 ];
			category = randomCategory[0];
			subcategory = randomCategory[1];
		}
		else {
			const keys = Object.keys(loLeftCon);
			category = keys[ keys.length * Math.random() << 0 ];
			const subkeys = Object.keys(loLeftCon[category]);
			subcategory = subkeys[ subkeys.length * Math.random() << 0 ];
		}

		let options = [ ...loLeftCon[category][subcategory]];
		let answerArr = [];
		for (let j = 0; j < 4; j++) {
			const index = options.length * Math.random() << 0
			const mon = options[index];
			loCells.push(mon);
			answerArr.push(mon)
			options.splice(index, 1);
		}
		loAnswers[category + subcategory] = answerArr;
		if (i === 0) {
			loColors[category + subcategory] = "yellow";
		}
		else if (i === 1) {
			loColors[category + subcategory] = "green";
		}
		else if (i === 2) {
			loColors[category + subcategory] = "blue";
		}
		else {
			loColors[category + subcategory] = "purple";
		}

		if (i < 4) {
			delete loLeftCon[category];
			priorityCons = [];
			for (const key in nections) {
				for (const subkey in nections[key]) {
					for (const mon of nections[category][subcategory]) {
						if (loLeftCon[key] && loLeftCon[key][subkey] && loLeftCon[key][subkey].includes(mon)) {
							index = loLeftCon[key][subkey].indexOf(mon);
							loLeftCon[key][subkey].splice(index, 1);
							if (loLeftCon[key][subkey].length < 4) {
								delete loLeftCon[key][subkey];
								if (Object.keys(loLeftCon[key]).length < 1) {
									delete loLeftCon[key];
								}
								break;
							}
						}
					}
					if (Math.random() < i / 3) {
						for (const cell of loCells) {
							if (nections[key][subkey].includes(cell) && loLeftCon[key] && loLeftCon[key][subkey]) {
								priorityCons.push([key, subkey]);
							}
						}
					}
				}
			}
		}
	}

	completed.innerHTML = "";
	cells.innerHTML = "";
	shuffleAnArray(loCells);
	for (const cell of loCells) {
		cells.innerHTML += `<div class="cell" onclick="onCellClick(this)">` + cell + `</div>`;
	}

	mistakes.innerHTML = `Mistakes remaining: ⚫⚫⚫⚫`
}
function onCellClick(cell) {
	const loDivs = cells.getElementsByClassName("cell");
	const loSelectedCells = [];
	for (const cell of loDivs) {
		if (cell.classList.contains("selected")) {
			loSelectedCells.push(cell.innerHTML);
		}
	}
	if (loSelectedCells.length === 4 && !cell.classList.contains("selected")) {
		return;
	}
	cell.classList.toggle("selected");
}

// Buttons
function shuffle() {
	if (mistakesLeft < 4) {
		cells.innerHTML = "";
		shuffleAnArray(loCells);
		for (const cell of loCells) {
			cells.innerHTML += `<div class="cell" onclick="onCellClick(this)">` + cell + `</div>`;
		}
	}
}
function deselect() {
	if (mistakesLeft < 4) {
		const loDivs = cells.getElementsByClassName("cell");
		for (const cell of loDivs) {
			cell.classList.remove("selected");
		}
	}
}
function submit() {
	const loDivs = cells.getElementsByClassName("cell");
	const loSelectedCells = [];
	for (const cell of loDivs) {
		if (cell.classList.contains("selected")) {
			loSelectedCells.push(cell.innerHTML);
		}
	}
	if (loSelectedCells.length != 4) {
		return;
	}
	const answerStr = arrayToString(loSelectedCells);
	if (wrongAnswers.includes(answerStr)) {
		popup("Already Guessed!");
		return;
	}

	const count = checkAnswer(loSelectedCells);
	if (count && count !== 3) {
		for (const cell of loSelectedCells) {
			const index = loCells.indexOf(cell);
			loCells.splice(index, 1);
		}

		completed.innerHTML += `
			<div class="complete ` + loColors[count] + `">
				<div class="title">` + count + `</div>
				<div class="sub">` + arrayToString(loSelectedCells) + `</div>
			</div> `;

		cells.innerHTML = "";
		for (const cell of loCells) {
			cells.innerHTML += `<div class="cell" onclick="onCellClick(this)">` + cell + `</div>`;
		}

		delete loAnswers[count];
	}
	else {
		wrongAnswers.push(answerStr);
		mistakesLeft += 1;
		mistakes.innerHTML = `Mistakes remaining: `;
		for (let i = 0; i < 4; i++) {
			if (i < mistakesLeft) {
				mistakes.innerHTML += `🔴`;
			}
			else {
				mistakes.innerHTML += `⚫`;
			}
		}

		if (mistakesLeft === 4) {
			popup("Game Over!");
			for (const cell of loDivs) {
				cell.classList.remove("selected");
				cell.classList.add("selected");
				cell.onclick = null;
			}
		}
		else if (count === 3) {
			popup("One Away!");
		}


	}
}
function revealAnswers() {
	cells.innerHTML = "";
	for (const answer in loAnswers) {
		completed.innerHTML += `
			<div class="complete ` + loColors[answer] + `">
				<div class="title">` + answer + `</div>
				<div class="sub">` + arrayToString(loAnswers[answer]) + `</div>
			</div> `;
	}
}

// Helpers
function shuffleAnArray(array) {
	let currentIndex = array.length;
	while (currentIndex != 0) {
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
}
function arrayToString(array) {
	array.sort();
	return array.join(", ");
}
function checkAnswer(array) {
	let count = 0;
	for (const cat in loAnswers) {
		count = 0;
		for (const cell of array) {
			if (loAnswers[cat].includes(cell)) {
				count += 1;
			}
		}
		if (count === 4) {
			return cat;
		}
		if (count === 3) {
			return 3;
		}
	}
	return false;
}
function popup(str) {
	header.innerHTML = str;
	header.style.color = "red";
	setTimeout(() => {
		header.innerHTML = "Poke-Nections!";
		header.style.color = "white";
	}, 2000);
}