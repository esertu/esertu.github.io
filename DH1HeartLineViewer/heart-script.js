// note to self - open up a local server to make fetch work locally, eg cmd -> python -m http.server 8000
// and then access it at http://localhost:8000/

// loading data from JSON
async function loadData() {
	try {
		const response = await fetch('./data.json');
		
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}

		const fetchedData = await response.json();
		data.dialogData = fetchedData;

	} catch (err) {
		console.error('Failed to load data JSON:', err);
	}
};

// loading hash data from JSON
async function loadHashData() {
	try {
		const response = await fetch('./hashdata.json');
		
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}

		const hashData = await response.json();
		data.hashData = hashData;

	} catch (err) {
		console.error('Failed to load hashdata JSON:', err);
	}
};

// runs when change in drop-down menu occurs
function changeHandler(type, rowN) {
	console.log("");
	console.log("changeHandler for rowN " + rowN);
	const thisSelect = elms.get("select" + rowN + type);
	const thisValue = thisSelect.value;
	
	// updating the other, hidden dropdown too
	elms.get("select" + rowN + expertTypeOpposite[type]).value = thisValue;
	
	// hiding any dropdowns past this one
	var n = rowN + 1;
	const currentMaxDepth = currentState.depthState["Maximum"];
	while (n <= currentMaxDepth) {
		setVisibilityBothDropdownsInRow(n, "none");
		n = n + 1;
	};
	
	// hiding the blurb display
	setVisibilityAllBlurbs("none");
	
	if (thisValue.includes("DisConv_Blurb") || thisValue.includes("SequentialBranch")) {
		if (thisValue.includes("DisConv_Blurb")) {
			currentState.depthState["Single"] = rowN;
			currentState.depthState.freezeFull = true;
			
			buildBlurbDisplay(rowN + 1 , false, "blurb");
			
		} else {
			// don't update blurb display etc. if this is a SequentialBranch after a SequentialBranch so the original SequentialBranch continues to be the one that gets displayed when list view is activated
			if (rowN <= currentState.depthState["Full"] || elms.get("blurbDisplaySingleNormal") == null || currentState.depthState.freezeFull == false) {
				currentState.depthState["Full"] = rowN;
				currentState.depthState["Full"] = rowN;
				
				buildBlurbDisplay(rowN + 1 , false, "branch");
			};
			
			currentState.depthState["Single"] = rowN + 1;
			
			currentState.depthState.freezeSingle = true;
			
			updateArrDisplayedd(rowN);
			buildDropdown(rowN + 1);
			applyChkExpert();
			applyChkBlurb();
		};
	} else {
		if (thisValue != "") {
			updateArrDisplayedd(rowN);
			buildDropdown(rowN + 1);
			applyChkExpert();
			
			if (rowN <= currentState.depthState["Single"] || rowN <= currentState.depthState["Full"]) {
				if (rowN <= currentState.depthState["Single"]) {
					currentState.depthState["Single"] = rowN;
					currentState.depthState.freezeSingle = false;
				};
				
				if (rowN <= currentState.depthState["Full"]) {
					currentState.depthState["Full"] = rowN;
					currentState.depthState.freezeFull = false;
				};
			} else {
				if (currentState.depthState.freezeFull == false) {
					currentState.depthState["Full"] = rowN;
				};
				if (currentState.depthState.freezeSingle == false) {
					currentState.depthState["Single"] = rowN;
				};
			};
			
			
		};
	};
	
};

function showOnlyThis(strIDStart, strIDType) {
	var strIDStart = strIDStart;
	// setting this thing to visible
	setVisibility(strIDStart + strIDType);
	
	
	// setting all other relevant things to invisible
	// dropdowns: set other dropdown invsibile
	if (strIDStart.includes("select")) {
		setVisibility(strIDStart + expertTypeOpposite[strIDType] , "none");
		
	// blurbs: set all other blurbs to invisible
	} else {
		setVisibility(strIDStart + expertTypeOpposite[strIDType] , "none");
		if (strIDStart.includes("Full")) {
			setVisibility(strIDStart.replace("Full","Single") + strIDType , "none");
			setVisibility(strIDStart.replace("Full","Single") + expertTypeOpposite[strIDType] , "none");
		} else {
		};
	};
};

// runs to apply the expertState setting, ie which dropdowns and blurb display variants should be showing
function applyChkExpert() {
	const currentExpert = currentState.expertState;
	const otherExpert = expertTypeOpposite[currentExpert];
	const currentBlurb = currentState.blurbState;
	const otherBlurb = blurbTypeOpposites[currentBlurb];
	
	var rowN = 0;
	
	console.log(">> applyChkExpert is now attempting to show: " + "select" + rowN + currentExpert);
	
	const currentMaxDepth = currentState.depthState["Maximum"];
	const currentDisplayDepth = currentState.depthState[currentBlurb];
	
	// showing the relevant dropdowns and hiding the currently active ones
	while (rowN <= currentMaxDepth && rowN <= currentDisplayDepth) {
		if (elms.get("select" + rowN + currentExpert).style.display == "none") {
			showOnlyThis("select" + rowN, currentExpert);
		} else {
			break;
		};
		rowN = rowN + 1;
	};
	
	console.log(">> applyChkExpert is now attempting to show: " + "blurbDisplay" + currentBlurb + currentExpert);
	
	// showing the other relevant blurb display and hiding the currently active one
	if (elms.get("blurbDisplaySingleNormal") != null) {
		if (elms.get("blurbDisplay" + currentBlurb + otherExpert).style.display != "none") {
			showOnlyThis("blurbDisplay" + currentBlurb, currentExpert);
		};
	};
};

// runs when the expert checkbox is checked or unchecked
function changeChkExpert() {
	// flipping the convenience value to Normal or Expert
	currentState.expertState = expertTypeOpposite[currentState.expertState];
	
	// applying the effects of the new value to the page by showing/hiding the right dropdowns and blurb list
	applyChkExpert();
};

function applyBlurbListView(rowN) {
	var thisSelect = elms.get("select" + rowN + currentState.expertState);
	const currentMaxDepth = currentState.depthState["Maximum"];
	
	//going down the list of dropdowns to find the first selected SequentialBranch
	while (rowN <= currentMaxDepth) {
		if (thisSelect.style.display != 'none') {
			if (thisSelect.value.includes("SequentialBranch")) {
				//hiding the remaining dropdowns once that SequentialBranch-valued dropdown has been found
				rowN = rowN + 1;
				var hideSelect = elms.get("select" + rowN + currentState.expertState)
				while (elms.get("select" + rowN + currentState.expertState) != null) {
					if (hideSelect.style.display != 'none') {
						setVisibility("select" + rowN + currentState.expertState,"none");
					} else {
						break
					};
					
					rowN = rowN + 1;
					hideSelect = elms.get("select" + rowN + currentState.expertState);
				};
				
				setVisibility("blurbDisplayFull" + currentState.expertState);
		
				break
			} else {
				if (elms.get("select" + currentState.depthState["Single"] + "Expert").value.includes("[Null]")) {
					setVisibility("blurbDisplaySingle" + currentState.expertState);
				};
		}
		};
		rowN = rowN + 1;
		thisSelect = elms.get("select" + rowN + currentState.expertState);
	};
};

function applySingleBlurbView(rowN) {
	const currentMaxDepth = currentState.depthState["Maximum"];
	
	while (rowN <= currentMaxDepth) {
		if (rowN <= currentState.depthState[currentState.blurbState]) {
			showOnlyThis("select" + rowN, currentState.expertState);
			
			if (rowN == currentState.depthState[currentState.blurbState] && (elms.get("select" + rowN + currentState.expertState).value.includes("Blurb") || elms.get("select" + rowN + currentState.expertState).value.includes("[Null]"))) {
				setVisibility("blurbDisplaySingle" + currentState.expertState);
			};
		};
		
		rowN = rowN + 1;
		
	};
};

function applyChkBlurb() {
	console.log("applyChkBlurb for blurbState " + currentState.blurbState);
	var rowN = 0;
	var thisSelect = elms.get("select" + rowN + currentState.expertState);
	
	
	setVisibilityAllBlurbs("none");
	
	if (currentState.blurbState == "Full") {
		applyBlurbListView(rowN);
	} else {
		applySingleBlurbView(rowN);
	};
	console.log("applyChkBlurb end");
};

function changeChkBlurb() {
	// flipping the convenience value to Single or Full
	currentState.blurbState = blurbTypeOpposites[currentState.blurbState];
	
	// applying the effects of the new value to the page by showing/hiding the right blurb list
	applyChkBlurb();
};

// setting visibility of all blurb displays to something
// find it easier to read when this is just its own function even though it doesn't need to be
function setVisibilityAllBlurbs(thisVisibility) {
	if (elms.get("blurbDisplayFullNormal") != null) {
		blurbDisplays.forEach((element) => setVisibility(element, thisVisibility));
	};
};

// setting visibility of all lines of a certain row to something
// find it easier to read when this is just its own function even though it doesn't need to be
function setVisibilityBothDropdownsInRow(rowN, thisVisibility) {
	expertTypes.forEach((element) => setVisibility("select" + rowN + element, thisVisibility));
};

// set the visibility of a thing to something (ie "none", "block", "list-item" etc.) if that thing exists. If blnCreateNew is true, then create the thing first if it doesn't exist
function setVisibility(thingName, thingVisibility, blnCreateNew) {
	console.log("setting visibility for " + thingName + " to " + thingVisibility);
	thisThing = getOrBuildThing(thingName, "", blnCreateNew);
	
	if (thisThing != null) {
		// if thingVisibility has been given, just apply it
		if (thingVisibility) {
			thisThing.style.display = thingVisibility;
			
		// otherwise, get the value from the styles Map
		} else {
			if (thingName.includes("blurb")) {
				if (thingName.includes("Full")) {
					thingVisibility = styles.blurbFull;
				} else {
					thingVisibility = styles.blurbSingle;
				};
			} else {
				thingVisibility = styles.select;
			};
			thisThing.style.display = thingVisibility;
		};
	};
};

// either fetch the reference to an element already on the page or build a new element and add it to the page. If blnCreateNew is false, do not build a new element and instead return null if the element does not already exist.
function getOrBuildThing(thingName, thingType, blnCreateNew) {
	
	if (document.getElementById(thingName) != null) {
		return(document.getElementById(thingName));
		
	} else {
		if (blnCreateNew) {
			const newThing = document.createElement(thingType);
			newThing.id = thingName;
			document.body.appendChild(newThing);
			
			elms.set(thingName, newThing);
			
			return(newThing)
			
		} else {
			return(null);
		};
	};
	
};

function updateArrDisplayedd(rowN) {
	const currentLength = currentState.arrDisplayed.length;
	
	for (var i = rowN; i <= currentLength; i++) {
		currentState.arrDisplayed.pop();
	};
	
	thisSelectNormal = elms.get("select" + rowN + "Normal");
	currentState.arrDisplayed.push(thisSelectNormal.children[thisSelectNormal.selectedIndex].label);
};


function applyBlurbToDisplay(targetName, htmlIn) {
	
	if (targetName.includes("Full")) {
		var thisThing = getOrBuildThing(targetName, "ol", true);
	} else {
		var thisThing = getOrBuildThing(targetName, "ul", true);
	};
	
	thisThing.innerHTML = htmlIn;
};

// building the blurblist elements
function ensureBlurbDisplaysExist() {
	getOrBuildThing("blurbDisplaySingleNormal", "ul", true);
	getOrBuildThing("blurbDisplaySingleExpert", "ul", true);
	getOrBuildThing("blurbDisplayFullNormal", "ol", true);
	getOrBuildThing("blurbDisplayFullExpert", "ol", true);
};

// filling the "[Null]" branch ending blurb displays for all four blurb display types
function fillTerminatingBlurbDisplay() {
	blurbTypes.forEach((blurbType) => {
		expertTypes.forEach((expertType) => {
			applyBlurbToDisplay("blurbDisplay" + blurbType + expertType, "[Branch terminates here]");
		});
	});
};

function getEntireBlurbTextAndHash(thisSelect) {
	//getting the blurb text
	const thisBlurb = findInData(data.dialogData.dialogItems,thisSelect.value);
	
	if (thisSelect.value.includes("SequentialBranch") == false) {
		var [thisBlurbText , thisBlurbHash] = getThisBlurbTextAndHash(thisBlurb , "single");
	} else {
		var [thisBlurbText , thisBlurbHash] = getThisBlurbTextAndHash(thisBlurb , "branch");
	};
	
	return([thisBlurbText , thisBlurbHash]);
};
	
function buildBlurbHTML(thisSelect , thisBlurbText , thisBlurbHash) {
	var newTextNorm = "";
	var newTextExp = "";
	
	for (var n = 0; n < thisBlurbText.length; n++) {
		// adding the blurb text to the blurblist
		if (thisBlurbText.length == 1) {
			newTextNorm = "\"" + thisBlurbText[n] + "\"";
			newTextExp = "\"" + thisBlurbText[n] + "\"";
			newTextExp += "<br>" + thisBlurbHash[n];
		} else {
			
			if (thisBlurbHash[n] != "") {
				newTextNorm += "<li>" +"\"" + thisBlurbText[n] + "\"";
				newTextExp += "<li>" +"\"" + thisBlurbText[n] + "\"";
				newTextExp += "\n" + thisBlurbHash[n] + "</li>";
				
			} else {
				newTextNorm += "</ul>";
				newTextNorm += buildHeadline("Switching to additional branch",2);
				newTextNorm += "<ol>";
				
				newTextExp += "</ul>";
				newTextExp += buildHeadline("\"" + thisBlurbText[n] + "\"",2)
				newTextExp += "<ol>";
			};
		};
		
	};
		
	var arrNewText = {
		"Normal": newTextNorm,
		"Expert": newTextExp
	};
	
	return(arrNewText)
};

function applyBlurbHTML(thisSelect, arrNewText) {
		
		if (thisSelect.value.includes("SequentialBranch")) {
			var applyTo = "Full"
		} else {
			var applyTo = "Single"
		};
		
		console.log("/// building display for blurbDisplay" + applyTo);
		
		expertTypes.forEach((expertType) => {
			applyBlurbToDisplay("blurbDisplay" + applyTo + expertType, arrNewText[expertType]);
		});
};

function buildBlurbDisplay(rowN, empty , originator) {
	console.log("buildBlurbDisplay running for rowN " + rowN + " " + originator);
	// making sure there aren't any more dropdowns below the blurblist
	clearFurtherDropdowns(rowN);
	
	// building the blurblist elements if they don't already exist
	ensureBlurbDisplaysExist();
	
	// if this runs with the empty tag, this is a "[Null]" terminating branch and we need to fill the blurb display accordingly
	if (empty) {
		fillTerminatingBlurbDisplay();
	} else {
		
		const thisSelect = elms.get("select" + (rowN - 1) + "Expert");
		
		[thisBlurbText , thisBlurbHash] = getEntireBlurbTextAndHash(thisSelect);
		
		arrNewText = buildBlurbHTML(thisSelect, thisBlurbText , thisBlurbHash);
		
		applyBlurbHTML(thisSelect, arrNewText);
	
		// showing the relevant blurb display
		if (thisSelect.value != "[Null]") {
			showOnlyThis("blurbDisplay" + currentState.blurbState, currentState.expertState);
		} else {
			setVisibilityBothDropdownsInRow(rowN, "none")
		};
	};
};


function getThisBlurbTextAndHash(thisBlurb , mode) {
	const thisBPaths = thisBlurb.branchPaths;
	
	var arrTexts = new Array();
	var arrHashes = new Array();
	
	for (var n = 0; n < thisBPaths.length; n++) {
		var thisText = thisBPaths[n].branchPathValue;
		var thisHash = findInHashData(data.hashData.hashItems, thisBlurb.itemName);
		
		if (mode != "single") {
			var thisName = thisBPaths[n].branchPathValue;
			var thisItem = findInData(data.dialogData.dialogItems, thisName);
			
			thisText = thisItem.branchPaths[0].branchPathValue;
			thisHash = findInHashData(data.hashData.hashItems, thisName);
			
			if (thisName.includes("SequentialBranch") == false) {
				thisHash = thisHash.hashName;
				
				arrTexts.push(thisText);
				arrHashes.push(thisHash);
			} else {
					var additionalBranch = findInData(data.dialogData.dialogItems, thisName);
					var [additionalTexts , additionalHashes] = getThisBlurbTextAndHash(additionalBranch , "branch");
					arrTexts.push(thisName);
					arrHashes.push("");
					
					for (var i = 0; i < additionalTexts.length; i++) {
						arrTexts.push(additionalTexts[i]);
						arrHashes.push(additionalHashes[i]);
					};
				
			};
			
		};
		
		if (mode == "single") {
			thisHash = thisHash.hashName;
			
			arrTexts.push(thisText);
			arrHashes.push(thisHash);
		};
		
	};
	
	return([arrTexts, arrHashes])
};


// clearing all further dropdowns as well as removing the blurblist from view when an earlier dropdown is changed
function clearFurtherDropdowns(rowN) {
	var n = 0;
	const currentMaxDepth = currentState.depthState["Maximum"];
	
	while ((rowN + n) <= currentMaxDepth) {
		expertTypes.forEach((type) => {
			
			// clearing dropdown of its children
			var thisSelect = elms.get("select" + (rowN + n) + type);
			while (thisSelect.firstChild) {
				thisSelect.firstChild.remove()
			};
				
			setVisibility("select" + (rowN + n) + type,"none");
			
		});
		
		n = n + 1;
	};
	
	//hiding the blurb display
	setVisibilityAllBlurbs("none");
};

//finding an item by its itemName in the data
function findInData(arrSearch,strSearch) {
	for (var n = 0; n < arrSearch.length; n++) {
		if (arrSearch[n].itemName == strSearch) {
			return(arrSearch[n])
			break
		};
	};
};

//finding an item by its blurbName in the data
function findInHashData(arrSearch,strSearch) {
	for (var n = 0; n < arrSearch.length; n++) {
		if (arrSearch[n].blurbName == strSearch) {
			return(arrSearch[n])
			break
		};
	};
	
	return(null);
};

function numToText(intIn) {
	switch (intIn) {
		case 1:
			outTxt = "1st";
			break
			
		case 2:
			outTxt = "2nd";
			break
			
		case 3:
			outTxt = "3rd";
			break
			
		default:
			outTxt = intIn + "th";
	};
	outTxt = outTxt + " time";
	
	return(outTxt);
};

//extracting number from between two square brackets
function numberFromBrackets(inputName) {
	inputName = inputName.slice(inputName.search("\\[")+1,inputName.search("\\]"))
	inputName = Number(inputName) //since we do math to this number later we need it as an explicit number
	return(inputName);
};

//extracting number from between an underscore and a period, ie DisConv_Blurb_14.1398 -> 14
function numberFromItem(inputName) {
	if (inputName.includes("_") == false) {
		inputName = 0;
	} else {
		inputName = inputName.slice(inputName.search("_")+1)
		if (inputName.includes("_") == false) {
			inputName = 0;
		} else {
			inputName = inputName.slice(inputName.search("_")+1)
			inputName = inputName.slice(0,inputName.search("\\."))
			inputName = Number(inputName) //since we do math to this number later we need it as an explicit number
		};
	};
	return(inputName);
};

function createFriendlyTerm_DisSpeaker(inputName, rowN) {
	// "DisSpeakerStoryGroup = Twk_ID_Calista"
	if (inputName.slice(0,30) == "DisSpeakerStoryGroup = Twk_ID_") {
		if (rowN != 3) {
			outputName = "Targeted NPC is " + inputName.slice(30);
			outputName = outputName.replace("Lord","Lord ");
			outputName = outputName.replace("Boyle"," Boyle");
			outputName = outputName.replace("SlackJaw","Slackjaw");
			outputName = outputName.replace("Granny","Granny ");
			outputName = outputName.replace("Madam","Madame Prudence");
			
		} else {
			outputName = "Targeted NPC is a";
			
			//"a Overseer" -> "an Overseer"
			if (inputName.slice(30,31) == "A") {
				// female Aristocrats (AristoFemale) don't need the n because they're "a[!] female Aristocrat" in display
				if (inputName.slice(30,32) != "Ar") {
					outputName = outputName + "n"
				};
			} else {
				if (inputName.slice(30,31) == "O") {
					outputName = outputName + "n"
				} else {
					if (inputName.slice(30,31) == "E") {
						outputName = outputName + "n"
					};
				};
			};
			
			outputName = outputName + " ";
			
			// adding the determined name to the base phrase
			// "DisSpeakerStoryGroup = Twk_ID_AristoFemale" -> "AristoFemale"
			outputName = outputName + inputName.slice(30);
			
			// "CityGuard" -> "City Guard"
			outputName = outputName.replace("Guard","	Guard");
			
			// handling "Male" and "Female" by moving it from the end of the string to the start, ie ("Twk_ID_AristoFemale" ->) "AristoFemale" -> "female Aristo"
			if (inputName.slice(-3) == "ale") {
				var NPCType = inputName.slice(30,36); //ie Aristo
				
				//writing out full names from shortened ones
				switch (NPCType) {
					case "Aristo":
						NPCType = "Aristocrat";
						break
					case "Middle":
						NPCType = "Middle class citizen";
						break
				};
				
				var NPCGender = inputName.slice(36); //ie Female
				NPCGender = NPCGender.replace("F","f").replace("M","m") //ie Female -> female
				
				outputName = outputName = outputName.slice(0,18) + NPCGender + " " + NPCType; //ie "female Aristocrat"
			};
			
			// removing "s" from group names (ie "Overseers" -> "Overseer"
			if (outputName.slice(-1) == "s") {
				outputName = outputName.slice(0,-1);
			};
			
			// adding clarifier about the two groups for Overseers
			if (outputName.slice(-4) == "seer") {
				outputName = outputName + " (1st group)"
			};
		};
		
	} else {
		
		if (inputName == "DisSpeakerStoryGroup = SG_Ovrsr_Overseers_Twk") {
			// adding clarifier about the two groups for Overseers
			outputName = "Targeted NPC is an Overseer (2nd group)";
		} else {
			outputName = "Targeted NPC is none of the above";
		};
	};
	
	return(outputName);
};

//wip: Null branches are broken again

function createFriendlyTerm_StoryFlag(inputName) {
	var prevVal = currentState.arrDisplayed[(currentState.arrDisplayed.length - 1)];
	
	//"Check: Is the player in the Golden Cat?" -> "Is the player in the Golden Cat"
	outputName = prevVal.slice(prevVal.search("Check: ")+7)
	outputName = outputName.replace("?","")
	
	// "Does the player know Lydia's identity?" -> "Player knows Lydia's identity"
	if (prevVal.includes("know")) {
		// "Does the player know Lydia's identity" -> "Player know Lydia's identity"
		outputName = outputName.replace("Does the p", "P");
		
		// "Player know Lydia's identity" -> "Player knows Lydia's identity" / "Player doesn't know Lydia's identity"
		if (inputName.slice(-1) == "1") {
			outputName = outputName.replace("know","doesn\'t know");
		} else {
			outputName = outputName.replace("know","knows");
		};
		
	// "Is the player in the High Overseer's Office" -> "Player is not in the High Overseer's Office"
	} else {
		// "Is the player in the High Overseer's Office" -> "Player in the High Overseer's Office"
		outputName = outputName.replace("Is the p", "P");
		
		// "Player in the High Overseer's Office" -> "Player is in the High Overseer's Office" / "Player is not in the High Overseer's Office"
		if (inputName.slice(-1) == "1") {
			outputName = outputName.replace(" in "," is not in ");
			outputName = outputName.replace(" on "," is not on ");
		} else {
			outputName = outputName.replace(" in "," is in ");
			outputName = outputName.replace(" on "," is on ");
		};
	};
	return(outputName);
};

// creating a less filename-y more readable name for a class
function createFriendlyName(inputName, rowN , thisBranchPathValue) {
	var outputName = ""
	
	switch (inputName.slice(0,10)) {
		//m_OutputLinks
		case "m_OutputLi":
			//DisConv_CheckStoryFlag
			if (thisBranchPathValue.slice(0,22) == "DisConv_CheckStoryFlag") {
				outputName = "";
			} else {
				outputName = (numberFromBrackets(inputName) + 1);
				outputName = numToText(outputName);
			};
			break;
			
		//m_Branches
		case "m_Branches":
			outputName = "Branch " + (numberFromBrackets(inputName) + 1);
			break;
			
		//DisConv_Blurb
		case "DisConv_Bl":
			outputName = "Voice line #" + (numberFromItem(inputName) + 1);
			break;
			
		//DisConv_RandomBranch
		case "DisConv_Ra":
			outputName = "Make a random choice";
			break;
			
		//DisConv_SpeakerInStoryGroup
		case "DisConv_Sp":
			outputName = "Check identity of targeted NPC";
			break;
			
		//DisConv_SequentialBranch
		case "DisConv_Se":
			outputName = "Play list of sequential items";
			break;
			
		//DisConv_CheckStoryFlag
		case "DisConv_Ch":
			outputName = "Check";
			break;
			
		//StoryFlag state 1 / StoryFlag state 2
		case "StoryFlag ":
			outputName = createFriendlyTerm_StoryFlag(inputName);
			break;
			
		//terminated branch
		case "[Null]":
			outputName = "[No lines]";
			break;
			
		default:
			outputName = inputName;
			console.log("missing createFriendlyName:");
			console.log(inputName);
	};
	
	return(outputName)
};

function createFriendlyConditionName(inputName, rowN) {
	switch (inputName.slice(0,10)) {
		//m_AssociatedTypes
		case "m_Associat":
			outputName = "Targeted NPC is a "
			//DisGameCrowdAgentSkeletalRat
			if (inputName.slice(-3) == "Rat") {
				outputName = outputName + "rat";
			//DisRiverKrust
			} else {
				outputName = outputName + "river krust";
			};
			break;
			
		case "EDisDialog":
			outputName = "Targeted NPC is none of the above";
			break;
			
		case "DisSpeaker":
			outputName = createFriendlyTerm_DisSpeaker(inputName, rowN);
			break;
			
		default:
			outputName = inputName;
	};
	
	return(outputName)
}


function buildThisDropdown(type, rowN) {
	// getting or building this drop-down menu
	console.log("buildThisDropdown for row " + rowN);
	const thisDropdownID = "select" + rowN + type;
	
	const currentMaxDepth = currentState.depthState["Maximum"];
	
	if (elms.get(thisDropdownID) != null) {
		var thisSelect = elms.get(thisDropdownID);
		if (rowN > 0) {
			clearFurtherDropdowns(rowN);
		};
		setVisibility(thisDropdownID);
	} else {
		var thisSelect = document.createElement("select");
		thisSelect.id = thisDropdownID;
		
		elms.set(thisDropdownID, thisSelect)
		
		//making sure the blurblist stays at the bottom of all the dropdown menus
		if (elms.get("blurbDisplaySingleNormal") != null) {
			document.body.insertBefore(thisSelect , elms.get("blurbDisplaySingleNormal"));
		} else {
			document.body.appendChild(thisSelect);
		};
		
		// adding the event listener to run things when the value fo this dropdown changes
		thisSelect.addEventListener("change", function() {
			changeHandler(type, rowN) ;
			});
	
		if (rowN > currentState.depthState["Maximum"]) {
			currentState.depthState["Maximum"] = rowN;
		};
	};
	
	return(thisSelect)
};

function buildDefaultOptions(rowN, thisSelectNormal , thisSelectExpert) {
	// adding the default starting "option", which is blank and can't be selected again later
	expertTypes.forEach((element) => {
		var option = document.createElement("option");
		option.disabled = true;
		option.selected = true;
		if (rowN == 0) {
			option.text = "Dlg_HeartGadget";
		} else {
			option.text = "";
		};
		option.value = -1;
		
		if (element == "Normal") {
			thisSelectNormal.appendChild(option);
		} else {
			thisSelectExpert.appendChild(option);
		};
	});
};

// splitting this up into two functions for readability even though it's slower since we do the if rowN == 0 check each time
function getPrevValue(rowN) {
	// first row is different because it's actually still the starting item
	if (rowN == 0) {
		prevSelectVal = null;
	} else {
		var prevSelect = elms.get("select" + (rowN - 1) + "Expert");
		prevSelectVal = prevSelect.value;
	};
	
	return(prevSelectVal);
};

// splitting this up into two functions for readability even though it's slower since we do the if rowN == 0 check each time
function getThisItem(prevSelectVal) {
	// first row is different because it's actually still the starting item
	if (prevSelectVal == null) {
		var thisItem = data.dialogData.dialogItems[0];
	} else {
		var thisItem = findInData(data.dialogData.dialogItems, prevSelectVal);
	};
	
	return(thisItem);
};

//wip: make data global

function createThisOptionText(thisItem , n, rowN) {
	var thisBranch = thisItem.branchPaths[n];
	var thisBranchPathName = thisBranch.branchPathName;
	var thisBranchPathValue = thisBranch.branchPathValue;
	var expertText = thisBranchPathName + " → " + thisBranch.branchPathValue;
	
	// normal text gets rather complicated behind the scenes to display something that's both short and hopefully understandable to the average layperson
	var normalText = ""
	if (thisBranch.friendlyName != null) {
		normalText = thisBranch.friendlyName;
	} else {
		normalText = createFriendlyName(thisBranchPathName, rowN , thisBranchPathValue);
	};

	// special: checkstoryflags
	if (thisBranchPathValue.includes("DisConv_Check") == false) {
		// don't need destination description in row 0 as it's already described by the origin
		if (rowN > 0) {
			if (thisBranch.branchPathCondition == null) {
				normalText = normalText + " → ";
				normalText = normalText + createFriendlyName(thisBranchPathValue, rowN);
			} else {
				normalText = createFriendlyName(thisBranchPathValue, rowN , thisBranchPathValue);
			};
		};
	} else {
		
		var thisStoryFlag = thisBranch.checkedStoryFlag;
		expertText = expertText + " (checked StoryFlag: " + thisStoryFlag + ")";
		
		var thisStoryFlag = thisBranch.checkedStoryFlagFriendly;
		if (rowN == 1) {
			normalText = "Check: " + thisStoryFlag;
		} else {
			normalText = normalText + " → ";
			normalText = normalText + "Check: " + thisStoryFlag;
		};
		
	};

	// special: conditions
	if (thisBranch.branchPathCondition != null) {
		var conditionVal = thisBranch.branchPathCondition;
		if (thisItem.itemName.includes("DisConv_Random")) {
			expertText = expertText + " (" + conditionVal + "% chance)";
			normalText = conditionVal + "% chance → " + normalText;
		} else {
			//wip
			expertText = expertText + " (if " + conditionVal + ")";
			
			if (normalText.slice(0,3) == " → ") {
				normalText = createFriendlyConditionName(conditionVal, rowN) + normalText;
			} else {
				normalText = createFriendlyConditionName(conditionVal, rowN) + " → " + normalText;
			};
		};
	};
	
	return([normalText, expertText , thisBranchPathValue]);
};

function buildDropdown(rowN) {
	// getting or building this drop-down menu
	var thisSelectNormal = buildThisDropdown("Normal", rowN)
	var thisSelectExpert = buildThisDropdown("Expert", rowN)
	
	// adding the default starting "option", which is blank and can't be selected again later
	buildDefaultOptions(rowN , thisSelectNormal , thisSelectExpert);
		
	// creating all dropdown options, which is the branchPathName and branchPathValue items of the item's branchPaths item
	
	// fetching the previous dropdown's value and the current item (which is the previous dropdown's value looked up in the data map)
	var prevSelectVal = getPrevValue(rowN);
	var thisItem = getThisItem(prevSelectVal);
	
	if (prevSelectVal == "[Null]") {
		buildBlurbDisplay(rowN + 1 , true , "blurb");
		showOnlyThis("select" + rowN, currentState.expertState);
	} else {
		// looking for the previous dropdown's value in the data array
	
		// actually creating the dropdown options
		for (var n = 0; n < thisItem.branchPaths.length; n++) {
			[normalText, expertText , thisBranchPathValue] = createThisOptionText(thisItem , n, rowN);
			
			// adding the resulting text as a new option to both ddropdown types
			//wip: replace this with buildDefaultOptions reworked to work for this too
			expertTypes.forEach((element) => {
				if (element == "Normal") {
					var thisText = normalText;
					var thisSelect = thisSelectNormal;
				} else {
					var thisText = expertText;
					var thisSelect = thisSelectExpert;
				};
				
				var option = document.createElement("option");
				option.text = thisText;
				option.value = thisBranchPathValue;
				thisSelect.appendChild(option);
			});
			
		};
			
		showOnlyThis("select" + rowN, currentState.expertState);
	};
};

function buildCheckBoxes() {

	arrCheckboxes.forEach((element) => {
		var check = document.createElement("input");
		check.id = 'check' + element;
		check.type = 'checkbox';
		
		var label = document.createElement("label");
		label.appendChild(check);
		
		if (element == "Expert") {
			var descriptiveText = "Display game object names instead of descriptive names"
			label.title = descriptiveText;
			label.appendChild(document.createTextNode("Expert mode"));
			
			check.addEventListener("change", function() { 
				changeChkExpert() 
				});
				
		} else {
			var descriptiveText = "Display all voicelines at the end of a branch at once instead of blurb by blurb"
			label.title = descriptiveText;
			label.appendChild(document.createTextNode("List mode"));
			
			check.addEventListener("change", function() { 
				changeChkBlurb() 
				});
		};
		
		document.body.appendChild(label);
	});
			
};

function buildHeadline(str,num,append) {
	if (append) {
		var thisHeadline = document.createElement("h" + num);
		thisHeadline.innerHTML = str;
		document.body.appendChild(thisHeadline);
	} else {
		return("<h" + num + ">" + str + "</h" + num + ">");
	};
};

function changeHandlerColl(collName){
	console.log(collName);
};

// inspired by https://stackoverflow.com/a/27698406 and https://medium.com/@jordanfinners/creating-a-collapsible-section-with-nothing-but-html-199f04f13377
function buildCollapsible(collName) {
	var collContentArr = new Array();
	strTitle = "";
	
	switch (collName) {
		case "Start":
			collContentArr.push("The starting point of all Heart lines is the DisDialogTree type object Dlg_HeartGadget.Dlg_HeartGadget in Startup.upk")
			collContentArr.push("DisDialogTree Dlg_HeartGadget.Dlg_HeartGadget has three conversation hooks which watch for inputs in order to fire dialogue.")
			collContentArr.push("Dlg_HeartGadget.Dlg_HeartGadget.DisConv_DialogHook fires if this was a non-targeted, i.e. ambient, whisper.")
			collContentArr.push("Dlg_HeartGadget.Dlg_HeartGadget.DisConv_Hook_HeartTargeted as well as DisConv_Hook_HeartTargeted_2 fire if this was a targeted whisper targeting an NPC. I'm not quite certain if the EDisDialogHook check is actually relevant, as both hooks have the exact same output branches - when targeting any human NPC they both go to DisConv_SpeakerInStoryGroup. The two HeartTargeted events ensure that rat and river krust lines play whether you're targeting an unique or non-unique NPC (which kind of implies the devs wanted to keep the possibility of adding unique rats/river krusts to the game). The following chain of checks first checks for unique NPCs, then, once all unique NPCs have been exhausted, for non-unique NPC groups. I get the feeling the devs initially wanted to check against the EDisDialogHook property to check whether unique or non-unique NPCs were being targeted but later decided to just run the same function in both cases.")
			collContentArr.push("The latter two hooks are also used to fire off rat and riverkrust lines if those creatures are targeted.") //wip: check if those are actually used
			
			strTitle = "Start of the dialogue tree";
			break;
			
		case "Classes":
			collContentArr.push("DisConv_SequentialBranch: lines will always play sequentially, i.e. one after the other.")
			collContentArr.push("DisConv_RandomBranch: game chooses one out of the available branches at random using the specified numbers as each branch's chance.")
			strTitle = "Some object classes";
			break;
			
		case "Technical":
			collContentArr.push("This site uses the UE Explorer naming convention of naming items \"[item name].[export table index]\", and of having zero-indexed items of a Class being named \"[Class]\" instead of \"[Class]_0\".")
			collContentArr.push("The drop-down menu items are formatted as [source] → [destination] or [source] → [effect]. The destination is an object on the ExportTable and the source is a property of the object displayed as the destination in the previous dropdown.")
			collContentArr.push("Text saying \"Play_...\" under voiceline text is the name of the audio file belonging to that line.")
			break;
	
		case "Other":
			collContentArr.push("One voiceline exists in Dlg_HeartGadget which isn't called by any branch of the dialogue tree. This voiceline is DisConv_Blurb_93 wth the text \"Callista. Yes, she is caretaker to the child.\". It most likely would have been part of DisConv_SequentialBranch_18, which is Callista's branch of targeted lines, and which conspicuously only has four lines in the final game where every other unique NPC has five.")
			collContentArr.push("Overseers have two DisSpeakerStoryGroups associated with them, one being SG_Ovrsr_Overseers_Twk and one being the more normally named Twk_ID_Overseers. The naming of the SG_Ovrsr group implies it was meant specifically and exclusively for Overseers in the High Overseer's Office, but in practice that map uses a mix of both factions. Since I couldn't determine the actual function of the two groups in the release version of the game I simply named them \"1st\" (Twk_ID) and \"2nd\" (SG_Ovrsr) group after the order they appear in the SpeakerInStoryGroup check.")
			break;
	};
	
	// collating the array into a single HTML string
	var collContent = "<ul>";
	collContentArr.forEach((element) => {
		collContent = collContent + "<li>" + element + "</li>";
	});
	collContent = collContent + "</ul>";
	
	var coll = document.createElement("details");
	if (strTitle == "") {
		coll.innerHTML = "<summary>" + collName + "</summary>";
	} else {
		coll.innerHTML = "<summary>" + strTitle + "</summary>";
	};
	
	coll.innerHTML += collContent;
	document.body.appendChild(coll);
	
	coll.addEventListener("toggle", function() { 
		changeHandlerColl(collName);
		});
};


// utility array of id strings for the two checkboxes, which will be called "check(string)"
const arrCheckboxes = [
	"Expert",
	"List"
];

// utility array of id strings for the four blurb displays
const blurbDisplays = [
	"blurbDisplaySingleNormal",
	"blurbDisplayFullNormal",
	"blurbDisplaySingleExpert",
	"blurbDisplayFullExpert",
];

// utility array of id string endings for the two dropdown types
const expertTypes = [
	"Normal",
	"Expert",
];
// utility map of id string endings for the two dropdown types where one maps to the other ie for when only one should be shown and therefore the other hidden
const expertTypeOpposite = {
	"Normal": "Expert",
	"Expert": "Normal",
};

// utility array of id string names for the two blurb displays types
const blurbTypes = [
	"Single",
	"Full",
];
// utility map of id string names for the two blurb types where one maps to the other ie for when only one should be shown and therefore the other hidden
const blurbTypeOpposites = {
	"Single": "Full",
	"Full": "Single",
};

// utility map of style.display types that a type of item should be displayed as
const styles = {
	"select": "block",
	"blurbSingle": "list-item",
	"blurbFull": "block",
};

// utility container of current page state
const currentState = {
	arrDisplayed: new Array(),
	expertState: expertTypes[0],
	blurbState: blurbTypes[0],
	
	depthState: {
		"Single": 0, // current depth of displayed dropdowns when single line blurb display is checked
		"Full": 0, // current depth of displayed dropdowns when multi line blurb display is checked
		freezeSingle: false,
		freezeFull: false,
		"Maximum": 0
	},
};

const data = {
	dialogData: null,
	hashData: null
};

// utility container of page elements
const elms = new Map();

//running everything
//building the basic page
buildHeadline("Info",1,true);
buildCollapsible("Start");
buildCollapsible("Classes");
buildCollapsible("Technical");
buildCollapsible("Other");
buildHeadline("Heart dialogue tree viewer",1,true);
buildCheckBoxes();

//getting the JSON data and then building the first dropdown
//getting main JSON data
loadData().then(data => { 
	console.log(data);
	
	//getting hash JSON data
	loadHashData().then(hashData => { 
		console.log(hashData);
		
		buildDropdown(0);
	});
});