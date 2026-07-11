// note to self - open up a local server to make fetch work locally, eg cmd -> python -m http.server 8000
// and then access it at http://localhost:8000/

// loading data from JSON
async function loadData() {
	try {
		const response = await fetch('./data.json');
		
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}

		const data = await response.json();
		return data

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
		return hashData

	} catch (err) {
		console.error('Failed to load hashdata JSON:', err);
	}
};

// runs when change in drop-down menu occurs
function changeHandler(type, rowN , data , hashData) {
	console.log("");
	console.log("changeHandler for rowN " + rowN);
	var thisSelect = document.getElementById("select" + rowN + type);
	currentState.currentDepth = rowN;
	currentState.fullDisplayed = rowN;
	
	// making sure the other, hidden dropdown updates too
	document.getElementById("select" + rowN + expertTypeOpposite[type]).value = thisSelect.value;
	
	// hiding any dropdowns past this one
	var n = rowN + 1
	while (document.getElementById("select" + n + "Normal") != null) {
		setVisibilityBothDropdownsInRow(n, "none");
		n = n + 1
	};
	
	// hiding the blurb display
	setVisibilityAllBlurbs("none");
	
	if (thisSelect.value != "") {
		
		if (thisSelect.value.includes("DisConv_Blurb") || thisSelect.value.includes("SequentialBranch")) {
			if (thisSelect.value.includes("DisConv_Blurb")) {
				buildBlurbDisplay(rowN + 1 , data , hashData, false, "blurb");
			} else {
				buildBlurbDisplay(rowN + 1 , data , hashData, false, "branch");
				updateArrDisplayedd(rowN);
				buildDropdown(rowN + 1 , data , hashData);
				applyChkExpert();
				applyChkBlurb();
			};
		} else {
			updateArrDisplayedd(rowN);
			buildDropdown(rowN + 1 , data , hashData);
		};
	};
	
};

function showOnlyThis(strIDStart, strIDType) {
	setVisibility(strIDStart + strIDType);
	setVisibility(strIDStart + expertTypeOpposite[strIDType] , "none");
};

// runs to apply the expertState setting, ie which dropdowns and blurb display variants should be showing
function applyChkExpert() {
	console.log("applyChkExpert");
	const currentExpert = currentState.expertState;
	const otherExpert = expertTypeOpposite[currentExpert];
	const currentBlurb = currentState.blurbState;
	const otherBlurb = blurbTypeOpposites[currentBlurb];
	
	var rowN = 0
	
	console.log(">> applyChkExpert is now attempting to show: " + "select" + rowN + currentExpert);
	
	// showing the relevant dropdowns and hiding the currently active ones
	// showing the relevant dropdowns and hiding the currently active ones
	while (document.getElementById("select" + rowN + currentExpert) != null) {
		if (document.getElementById("select" + rowN + currentExpert).style.display == "none") {
			showOnlyThis("select" + rowN, currentExpert);
		} else {
			break;
		};
		rowN = rowN + 1
	};
	
	console.log(">> applyChkExpert is now attempting to show: " + "blurbDisplay" + currentBlurb + currentExpert);
	
	// showing the other relevant blurb display and hiding the currently active one
	if (document.getElementById("blurbDisplaySingleNormal") != null) {
		if (document.getElementById("blurbDisplay" + currentBlurb + currentExpert).style.display == "none") {
			showOnlyThis("blurbDisplay" + currentBlurb, currentExpert);
		};
	};
	console.log("");
};

// runs when the expert checkbox is checked or unchecked
function changeChkExpert() {
	// flipping the convenience value to Normal or Expert
	currentState.expertState = expertTypeOpposite[currentState.expertState];
	
	// applying the effects of the new value to the page by showing/hiding the right dropdowns and blurb list
	applyChkExpert();
};

function applyChkBlurb() {
	console.log("applyChkBlurb");
	var n = 0
	var thisSelect = document.getElementById("select" + n + "Normal");
	
	var blurbDisplaySingleNormal = document.getElementById("blurbDisplaySingleNormal");
	
	var lastSelect = document.getElementById("select" + currentState.currentDepth + "Normal");
	
	setVisibilityAllBlurbs("none");
	
	if (currentState.blurbState == "Full") {
		//going down the list of dropdowns to find the first selected SequentialBranch
		while (thisSelect != null) {
			if (thisSelect.style.display != 'none') {
				if (thisSelect.value.includes("SequentialBranch")) {
					//hiding the remaining dropdowns once that SequentialBranch-valued dropdown has been found
					n = n + 1
					var hideSelect = document.getElementById("select" + n + "Normal")
					while (document.getElementById("select" + n + "Normal") != null) {
						if (hideSelect.style.display != 'none') {
							currentState.fullDisplayed = n;
							setVisibility("select" + n + "Normal","none");
						} else {
							break
						};
						
						n = n + 1;
						hideSelect = document.getElementById("select" + n + "Normal");
					};
					
					setVisibility("blurbDisplayFullNormal");
			
					break
				};
			};
			n = n + 1
			thisSelect = document.getElementById("select" + n + "Normal");
		};
		
	} else {
		while (n < currentState.fullDisplayed) {
			n = n + 1
			setVisibility("select" + n + "Normal");
			
			if (lastSelect.value.includes("Blurb")) {
				if (blurbDisplaySingleNormal != null) {
					setVisibility("blurbDisplaySingle" + currentState.expertState);
				};
			};
		};
		
	};
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
	blurbDisplays.forEach((element) => setVisibility(element, thisVisibility));
};

// setting visibility of all lines of a certain row to something
// find it easier to read when this is just its own function even though it doesn't need to be
function setVisibilityBothDropdownsInRow(rowN, thisVisibility) {
	expertTypes.forEach((element) => setVisibility("select" + rowN + element, thisVisibility));
};

// set the visibility of a thing to something (ie "none", "block", "list-item" etc.) if that thing exists. If blnCreateNew is true, then create the thing first if it doesn't exist
//wip: use this more
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
//wip: use this more
function getOrBuildThing(thingName, thingType, blnCreateNew) {
	
	if (document.getElementById(thingName) != null) {
		return(document.getElementById(thingName));
		
	} else {
		if (blnCreateNew) {
			var newThing = document.createElement(thingType);
			newThing.id = thingName;
			document.body.appendChild(newThing);
			return(newThing)
		} else {
			return(null);
		};
	};
	
};

function updateArrDisplayedd(rowN) {
	var currentLength = currentState.arrDisplayed.length
	for (var i = rowN; i <= currentLength; i++) {
		currentState.arrDisplayed.pop();
	};
	
	thisSelectNormal = document.getElementById("select" + rowN + "Normal");
	currentState.arrDisplayed.push(thisSelectNormal.children[thisSelectNormal.selectedIndex].label);
};


//wip: use this more
//wip: clean this up
function applyBlurbs(htmlIn, mode) {
	var arrRelevant = new Array();
	
	switch (mode) {
		case "all":
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleNormal", "ul", true));
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleExpert", "ul", true));
			arrRelevant.push(getOrBuildThing("blurbDisplayFullNormal", "ol", true));
			arrRelevant.push(getOrBuildThing("blurbDisplayFullExpert", "ol", true));
			break;
			
		case "full":
			arrRelevant.push(getOrBuildThing("blurbDisplayFullNormal", "ol", true));
			arrRelevant.push(getOrBuildThing("blurbDisplayFullExpert", "ol", true));
			break;
			
		case "single":
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleNormal", "ul", true));
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleExpert", "ul", true));
			break;
			
		case "normal":
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleNormal", "ul", true));
			arrRelevant.push(getOrBuildThing("blurbDisplayFullNormal", "ol", true));
			break;
			
		case "expert":
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleExpert", "ul", true));
			arrRelevant.push(getOrBuildThing("blurbDisplayFullExpert", "ol", true));
			break;
			
		case "singlenormal":
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleNormal", "ul", true));
			break;
			
		case "singleexpert":
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleExpert", "ul", true));
			break;
			
		case "fullnormal":
			arrRelevant.push(getOrBuildThing("blurbDisplayFullNormal", "ol", true));
			break;
			
		case "fullexpert":
			arrRelevant.push(getOrBuildThing("blurbDisplayFullExpert", "ol", true));
			break;
			
		case "all-contd":
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleNormal", "ul", true));
			arrRelevant.push(getOrBuildThing("blurbDisplaySingleExpert", "ul", true));
			arrRelevant.push(getOrBuildThing("blurbDisplayFullNormal", "ol", true));
			arrRelevant.push(getOrBuildThing("blurbDisplayFullExpert", "ol", true));
			break;
	};
	
	for (var n = 0; n < arrRelevant.length; n++) {
		arrRelevant[n].innerHTML = htmlIn
	};
};

//wip: boyles dont function correctly right now

function buildBlurbDisplay(rowN, data, hashData , empty , originator) {
	console.log("buildBlurbDisplay running for rowN " + rowN + " " + originator);
	// making sure there aren't any more dropdowns below the blurblist
	clearFurtherDropdowns(rowN);
	
	// getting or building the blurblist elements
	var blurbDisplaySingleNormal = getOrBuildThing("blurbDisplaySingleNormal", "ul", true);
	var blurbDisplaySingleExpert = getOrBuildThing("blurbDisplaySingleExpert", "ul", true);
	var blurbDisplayFullNormal = getOrBuildThing("blurbDisplayFullNormal", "ol", true);
	var blurbDisplayFullExpert = getOrBuildThing("blurbDisplayFullExpert", "ol", true);
	
	//wip: branch
	if (empty == true) {
		applyBlurbs("[Branch terminates here]" , "all-contd");
	} else {
		
		var thisSelect = document.getElementById("select" + (rowN - 1) + "Expert");
		console.log("thisSelect.value: ");
		console.log(thisSelect.value);
		
		//getting the blurb text
		var thisBlurb = findInData(data.dialogItems,thisSelect.value);
		if (thisSelect.value.includes("SequentialBranch") == false) {
			var [thisBlurbText , thisBlurbHash] = getBlurbTextAndHash(thisBlurb , hashData , data , "single");
		} else {
			var [thisBlurbText , thisBlurbHash] = getBlurbTextAndHash(thisBlurb , hashData , data , "branch");
		};
		
		var newTextNorm = ""
		var newTextExp = ""
		
		blurbDisplayFullNormal.innerHTML = "";
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
					newTextNorm += "<h2>" + "Switching to additional branch" + "</h2>";
					newTextNorm += "<ol>";
					
					newTextExp += "</ul>";
					newTextExp += "<h2>" +"\"" + thisBlurbText[n] + "\"</h2>";
					newTextExp += "<ol>";
				};
			};
			
		};
		
		if (thisSelect.value.includes("SequentialBranch")) {
			applyBlurbs(newTextNorm, "fullnormal");
			applyBlurbs(newTextExp, "fullexpert");
		} else {
			applyBlurbs(newTextNorm, "singlenormal");
			applyBlurbs(newTextExp, "singleexpert");
		};
		
	};
	
	// blurb visibility: hiding everything by default
	setVisibilityAllBlurbs("none");
	
	setVisibility("blurbDisplay" + currentState.blurbState + currentState.expertState);
};


function getBlurbTextAndHash(thisBlurb , hashData , data , mode) {
	var thisBPaths = thisBlurb.branchPaths
	
	var arrTexts = new Array();
	var arrHashes = new Array();
	
	for (var n = 0; n < thisBPaths.length; n++) {
		var thisText = thisBPaths[n].branchPathValue;
		var thisHash = findInHashData(hashData.hashItems, thisBlurb.itemName);
		
		if (mode != "single") {
			var thisName = thisBPaths[n].branchPathValue;
			var thisItem = findInData(data.dialogItems, thisName);
			
			thisText = thisItem.branchPaths[0].branchPathValue;
			thisHash = findInHashData(hashData.hashItems, thisName);
			
			//wip: further Branch
			if (thisName.includes("SequentialBranch") == false) {
				thisHash = thisHash.hashName;
				
				arrTexts.push(thisText);
				arrHashes.push(thisHash);
			} else {
					var additionalBranch = findInData(data.dialogItems, thisName);
					var [additionalTexts , additionalHashes] = getBlurbTextAndHash(additionalBranch , hashData , data , "branch");
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
	var n = 0
	while (document.getElementById("select" + (rowN + n) + "Expert") != null) {
		for (var i = 0; i <= 1; i++) {
			// clearing dropdown of its children
			var type = expertTypes[i];
			
			var thisSelect = document.getElementById("select" + (rowN + n) + type);
			if (thisSelect != null) {
				while (thisSelect.firstChild) {
					thisSelect.firstChild.remove()
				};
				
				setVisibility("select" + (rowN + n) + type,"none");
			};
			
		};
		
		n = n + 1
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

//wip: implement all classes 
// creating a less filename-y more readable name for a class
function createFriendlyName(inputName, rowN , data , thisBranchPathValue) {
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
			//wip: currentState.arrDisplayed for Boyle branches doesn't work correctly leading to error
			var prevVal = currentState.arrDisplayed[(currentState.arrDisplayed.length - 1)];
			
			//"Check: Is the player in the Golden Cat?" -> "Is the player in the Golden Cat"
			outputName = prevVal.slice(prevVal.search("Check: ")+7)
			outputName = outputName.replace("?","")
			
			// "Does the player know Lydia's identity?" -> "Player knows Lydia's identity"
			if (prevVal.includes("know")) {
				// "Does the player know Lydia's identity" -> "Player know Lydia's identity"
				outputName = outputName.replace("Does the p", "P") 
				
				// "Player know Lydia's identity" -> "Player knows Lydia's identity" / "Player doesn't know Lydia's identity"
				if (inputName.slice(-1) == "1") {
					outputName = outputName.replace("know","doesn\'t know")
				} else {
					outputName = outputName.replace("know","knows")
				};
				
			// "Is the player in the High Overseer's Office" -> "Player is not in the High Overseer's Office"
			} else {
				// "Is the player in the High Overseer's Office" -> "Player in the High Overseer's Office"
				outputName = outputName.replace("Is the p", "P") 
				
				// "Player in the High Overseer's Office" -> "Player is in the High Overseer's Office" / "Player is not in the High Overseer's Office"
				if (inputName.slice(-1) == "1") {
					outputName = outputName.replace(" in "," is not in ")
					outputName = outputName.replace(" on "," is not on ")
				} else {
					outputName = outputName.replace(" in "," is in ")
					outputName = outputName.replace(" on "," is on ")
				};
			};
			
			break;
			
		//terminated branch
		case "[Null]":
			outputName = "[No lines]";
			break;
			
		default:
			outputName = inputName;
			console.log("createFriendlyName:");
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
			
		//EDisDialogHook //wip
		case "EDisDialog":
			outputName = "Targeted NPC is none of the above";
			break;
			
		//DisSpeakerStoryGroup //wip
		case "DisSpeaker":
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
			break;
			
		default:
			outputName = inputName;
	};
	
	return(outputName)
}


function buildThisDropdown(type, rowN , data , hashData) {
	// getting or building this drop-down menu
	console.log("buildThisDropdown for row " + rowN);
	var thisDropdownID = "select" + rowN + type
	
	if (document.getElementById(thisDropdownID) != null) {
		var thisSelect = document.getElementById(thisDropdownID);
		clearFurtherDropdowns(rowN);
		setVisibility(thisDropdownID);
	} else {
		var thisSelect = document.createElement("select");
		thisSelect.id = thisDropdownID;
		
		//making sure the blurblist stays at the bottom of all the dropdown menus
		if (document.getElementById("blurbDisplaySingleNormal") != null) {
			document.body.insertBefore(thisSelect,document.getElementById("blurbDisplaySingleNormal"));
		} else {
			document.body.appendChild(thisSelect);
		};
		
		// adding the event listener to run things when the value fo this dropdown changes
		thisSelect.addEventListener("change", function() { 
			changeHandler(type, rowN , data , hashData) ;
			});
	
	};
	
	return(thisSelect)
};

//wip: fix [Null] branches
function buildDropdown(rowN , data , hashData) {
	// getting or building this drop-down menu
	var thisSelectNormal = buildThisDropdown("Normal", rowN , data , hashData)
	var thisSelectExpert = buildThisDropdown("Expert", rowN , data , hashData)
	
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
		
	// creating all dropdown options, which is the branchPathName and branchPathValue items of the item's branchPaths item
	// first row is different because it's actually still the starting item
	if (rowN == 0) {
		var thisItem = data.dialogItems[0]
		prevSelectVal = null
	} else {
		var prevSelect = document.getElementById("select" + (rowN - 1) + "Expert");
		prevSelectVal = prevSelect.value
		// looking for the previous dropdown's value in the data array
		var thisItem = findInData(data.dialogItems, prevSelectVal);
	};
	
	if (prevSelectVal == "[Null]") {
		buildBlurbDisplay(rowN + 1 , data , hashData, true , "blurb");
	} else {
	
		// actually creating the dropdown options
		for (var n = 0; n < thisItem.branchPaths.length; n++) {
			var thisBranch = thisItem.branchPaths[n]
			var thisBranchPathName = thisBranch.branchPathName
			var thisBranchPathValue = thisBranch.branchPathValue
			var expertText = thisBranchPathName + " → " + thisBranch.branchPathValue;
			
			// normal text gets rather complicated behind the scenes to display something that's both short and hopefully understandable to the average layperson
			var normalText = ""
			if (thisBranch.friendlyName != null) {
				normalText = thisBranch.friendlyName;
			} else {
				normalText = createFriendlyName(thisBranchPathName, rowN , data , thisBranchPathValue);
			};

			// special: checkstoryflags
			if (thisBranchPathValue.includes("DisConv_Check") == false) {
				// don't need destination description in row 0 as it's already described by the origin
				if (rowN > 0) {
					if (thisBranch.branchPathCondition == null) {
						normalText = normalText + " → ";
						normalText = normalText + createFriendlyName(thisBranchPathValue, rowN , data);
					} else {
						normalText = createFriendlyName(thisBranchPathValue, rowN , data , thisBranchPathValue);
					};
				};
			} else {
				
				var thisStoryFlag = thisBranch.checkedStoryFlag;
				expertText = expertText + " (checked StoryFlag: " + thisStoryFlag + ")";
				
				var thisStoryFlag = thisBranch.checkedStoryFlagFriendly;
				if (rowN == 1) {
					normalText = "Check: " + thisStoryFlag;
				} else {
					normalText = normalText + " → "
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
			
			// adding the resulting text as a new option to both ddropdown types
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
	};
	
	setVisibilityBothDropdownsInRow(rowN, "none");
			
	if (prevSelectVal != "[Null]") {
		setVisibility("select" + rowN + currentState.expertState);
	};
};

function buildCheckBoxes() {

	arrCheckboxes.forEach((element) => {
		var check = document.createElement("input");
		check.id = 'check' + element;
		check.type = 'checkbox';
		
		if (element == "Expert") {
			check.addEventListener("change", function() { 
				changeChkExpert() 
				});
		} else {
			check.addEventListener("change", function() { 
				changeChkBlurb() 
				});
		};
		
		var label = document.createElement("label");
		label.appendChild(check);
		label.appendChild(document.createTextNode(element));
		document.body.appendChild(label);
		
	}
	);
			
};

function changeHandlerColl(collName){
	console.log(collName);
};

// inspired by https://stackoverflow.com/a/27698406 and https://medium.com/@jordanfinners/creating-a-collapsible-section-with-nothing-but-html-199f04f13377
function buildCollapsible(collName) {
	var collContent = ""
	
	switch (collName) {
		case "Start":
			collContent = "The starting point of all Heart lines is the DisDialogTree type object Dlg_HeartGadget.Dlg_HeartGadget in Startup.upk"
			collContent += "\nDisDialogTree Dlg_HeartGadget.Dlg_HeartGadget has three conversation hooks which watch for inputs in order to fire dialogue."
			collContent += "\nDlg_HeartGadget.Dlg_HeartGadget.DisConv_DialogHook fires if this was a non-targeted, i.e. ambient, whisper."
			collContent += "\nDlg_HeartGadget.Dlg_HeartGadget.DisConv_Hook_HeartTargeted as well as DisConv_Hook_HeartTargeted_2 fire if this was a targeted whisper targeting an NPC. I'm not quite certain if the EDisDialogHook check is actually relevant, as both hooks have the exact same output branches - when targeting any human NPC they both go to DisConv_SpeakerInStoryGroup. The two HeartTargeted events ensure that rat and river krust lines play whether you're targeting an unique or non-unique NPC (which kind of implies the devs wanted to keep the possibility of adding unique rats/river krusts to the game). The following chain of checks first checks for unique NPCs, then, once all unique NPCs have been exhausted, for non-unique NPC groups. I get the feeling the devs initially wanted to check against the EDisDialogHook property to check whether unique or non-unique NPCs were being targeted but later decided to just run the same function in both cases."
			collContent += "\nThe latter two hooks are also used to fire off rat and riverkrust lines if those creatures are targeted." //wip: check if those are actually used
			break;
			
		case "Classes":
			collContent = "\nDisConv_SequentialBranch: lines will always play sequentially, i.e. one after the other."
			collContent += "\nDisConv_RandomBranch: game chooses one out of the available branches at random using the specified numbers as each branch's chance."
			break;
			
		case "Technical":
			collContent = "\nThis site uses the UE Explorer naming convention of naming items \"[item name].[export table index]\", and of having zero-indexed items of a Class being named \"[Class]\" instead of \"[Class]_0\"."
			collContent += "\nThe drop-down menu items are formatted as [source] → [destination], with the destination being an object on the ExportTable and the source being a property of the object displayed as the destination in the previous dropdown."
			collContent += "\nText saying \"Play_...\" under voiceline text is the name of the audio file belonging to that line."
			break;
	
		case "Other":
			collContent = "\nOne voiceline exists in Dlg_HeartGadget which isn't called by any branch of the dialogue tree. This voiceline is DisConv_Blurb_93 wth the text \"Callista. Yes, she is caretaker to the child.\". It most likely would have been part of DisConv_SequentialBranch_18, which is Callista's branch of targeted lines, and which conspicuously only has four lines in the final game where every other unique NPC has five."
			collContent += "\nOverseers have two DisSpeakerStoryGroups associated with them, one being SG_Ovrsr_Overseers_Twk and one being the more normally named Twk_ID_Overseers. The naming of the SG_Ovrsr group implies it was meant specifically and exclusively for Overseers in the High Overseer's Office, but in practice that map uses a mix of both factions. Since I couldn't determine the actual function of the two groups in the release version of the game I simply named them \"1st\" (Twk_ID) and \"2nd\" (SG_Ovrsr) group after the order they appear in the SpeakerInStoryGroup check."
			break;
	};
	
	var coll = document.createElement("details");
	coll.innerHTML = "<summary>" + collName + "</summary>";
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
	fullDisplayed: 0,
	arrDisplayed: new Array(),
	currentDepth: 0,
	expertState: expertTypes[0],
	blurbState: blurbTypes[0],
};

//running everything
//building the basic page
buildCollapsible("Start");
buildCollapsible("Classes");
buildCollapsible("Technical");
buildCollapsible("Other");
buildCheckBoxes();

//getting the JSON data and then building the first dropdown
//getting main JSON data
loadData().then(data => { 
	console.log(data);
	
	//getting hash JSON data
	loadHashData().then(hashData => { 
		console.log(hashData);
		
		buildDropdown(0 , data , hashData);
	});
});