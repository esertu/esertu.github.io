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
	var thisSelect = document.getElementById("select" + rowN + type);
	currentDepth = rowN;
	
	// hiding the blurb display
	if (document.getElementById("blurbDisplaySingle") != null) {
		var blurbDisplaySingle = document.getElementById("blurbDisplaySingle");
		blurbDisplaySingle.style.display = 'none';
	};
	
	if (document.getElementById("blurbDisplayFull") != null) {
		var blurbDisplayFull = document.getElementById("blurbDisplayFull");
		blurbDisplayFull.style.display = 'none';
		var blurbDisplayFullContd = document.getElementById("blurbDisplayFullContd");
		blurbDisplayFullContd.style.display = 'none';
	};
	
	// making sure the other, hidden dropdown updates too
	if (type == "normal") {
		document.getElementById("select" + rowN + "expert").value = thisSelect.value;
	} else {
		document.getElementById("select" + rowN + "normal").value = thisSelect.value;
	};
	
	if (thisSelect.value != "") {
		
		if (thisSelect.value.search("DisConv_Blurb") != -1 || thisSelect.value.search("Branch") != -1) {
			if (thisSelect.value.search("DisConv_Blurb") != -1) {
				buildBlurbDisplay(rowN + 1 , data , hashData, false, "blurb");
			} else {
				buildBlurbDisplay(rowN + 1 , data , hashData, false, "branch");
				updateArrDisplayed(rowN);
				buildDropdown(rowN + 1 , data , hashData);
			};
		} else {
			updateArrDisplayed(rowN);
			buildDropdown(rowN + 1 , data , hashData);
		};
	};
	
};

function updateArrDisplayed(rowN) {
	var currentLength = arrDisplayed.length
	for (var i = rowN; i <= currentLength; i++) {
		arrDisplayed.pop();
	};
	
	thisSelectNormal = document.getElementById("select" + rowN + "normal");
	arrDisplayed.push(thisSelectNormal.children[thisSelectNormal.selectedIndex].label);
};


function changeHandlerChk(strOrigin) {
	if (strOrigin == "expert") {
		var thisCheck = document.getElementById("checkExpert");
		var checkValue = thisCheck.checked;
		
		if (checkValue) {
			for (var n = 0; n <= currentDepth + 1; n++) {
				thisSelect = document.getElementById("select" + n + "expert");
				thisSelect.style.display = 'block';
				thisSelect = document.getElementById("select" + n + "normal");
				thisSelect.style.display = 'none';
			};
		} else {
			for (var n = 0; n <= currentDepth + 1; n++) {
				thisSelect = document.getElementById("select" + n + "expert");
				thisSelect.style.display = 'none';
				thisSelect = document.getElementById("select" + n + "normal");
				thisSelect.style.display = 'block';
			};
		};
		
	} else { 
		if (strOrigin == "blurb") {
			var thisCheck = document.getElementById("checkBlurb");
			var checkValue = thisCheck.checked;
			
			var blurbDisplaySingle = document.getElementById("blurbDisplaySingle");
			var blurbDisplayFull = document.getElementById("blurbDisplayFull");
			var blurbDisplayFullContd = document.getElementById("blurbDisplayFullContd");
			
			
			if (checkValue) {
				if (blurbDisplaySingle != null) {
					blurbDisplaySingle.style.display = 'none';
					blurbDisplayFull.style.display = 'list-item';
					blurbDisplayFullContd.style.display = 'list-item';
					
					document.getElementById("select" + (currentDepth - 1) + "normal").display = 'none';
					document.getElementById("select" + (currentDepth - 1) + "expert").display = 'none';
				};
			} else {
				if (blurbDisplaySingle != null) {
					blurbDisplaySingle.style.display = 'block';
					blurbDisplayFull.style.display = 'none';
					blurbDisplayFullContd.style.display = 'none';
					
					if (document.getElementById("checkExpert").checked) {
					  document.getElementById("select" + currentDepth + "expert").display = 'block';
					} else {
					  document.getElementById("select" + currentDepth + "normal").display = 'block';
					};
				};
			};
		};
	};
	
};

function buildCheckBoxExpert() {
	var checkExpert = document.createElement("input");
	checkExpert.id = 'checkExpert';
	checkExpert.type = 'checkbox';
	checkExpert.addEventListener("change", function() { 
		changeHandlerChk("expert") 
		});
	
	var lblExpert = document.createElement("label");
	lblExpert.appendChild(checkExpert);
	lblExpert.appendChild(document.createTextNode("Expert"));
	document.body.appendChild(lblExpert);
};

function buildCheckBoxBlurb() {
	var checkBlurb = document.createElement("input");
	checkBlurb.id = 'checkBlurb';
	checkBlurb.type = 'checkbox';
	checkBlurb.addEventListener("change", function() { 
		changeHandlerChk("blurb") 
		});
	
	var lblBlurbDisplay = document.createElement("label");
	lblBlurbDisplay.appendChild(checkBlurb);
	lblBlurbDisplay.appendChild(document.createTextNode("Display lines as list instead of as single lines"));
	document.body.appendChild(lblBlurbDisplay);
};

function buildBlurbDisplay(rowN, data, hashData , empty , mode) {
	// making sure there aren't any more dropdowns below the blurblist
	clearFurtherDropdowns(rowN);
	
	// getting or building the blurblist elements
	if (document.getElementById("blurbDisplaySingle") != null) {
		var blurbDisplaySingle = document.getElementById("blurbDisplaySingle");
		
	} else {
		var blurbDisplaySingle = document.createElement("ul");
		blurbDisplaySingle.id = "blurbDisplaySingle";
		document.body.appendChild(blurbDisplaySingle);
	};
	
	if (document.getElementById("blurbDisplayFull") != null) {
		var blurbDisplayFull = document.getElementById("blurbDisplayFull");
		var blurbDisplayFullContd = document.getElementById("blurbDisplayFullContd");
		
	} else {
		var blurbDisplayFull = document.createElement("ol");
		blurbDisplayFull.id = "blurbDisplayFull";
		document.body.appendChild(blurbDisplayFull);
		
		var blurbDisplayFullContd = document.createElement("ol");
		blurbDisplayFullContd.id = "blurbDisplayFullContd";
		document.body.appendChild(blurbDisplayFullContd);
	};
	
	//wip: branch
	if (empty == true) {
		blurbDisplaySingle.innerHTML = "[Branch terminates here]";
		blurbDisplayFull.innerHTML = "[Branch terminates here]";
	} else {
		
		var thisSelect = document.getElementById("select" + (rowN - 1) + "expert");
		console.log("thisSelect.value: ");
		console.log(thisSelect.value);
		
		//getting the blurb text
		var thisBlurb = findInData(data.dialogItems,thisSelect.value);
		if (thisSelect.value.search("Branch") == -1) {
			var [thisBlurbText , thisBlurbHash] = getBlurbTextAndHash(thisBlurb , hashData , data , "single");
		} else {
			var [thisBlurbText , thisBlurbHash] = getBlurbTextAndHash(thisBlurb , hashData , data , "branch");
		};
		
		var newText = ""
		var thisBlurbDisplayFull = blurbDisplayFull
		for (var n = 0; n < thisBlurbText.length; n++) {
			// adding the blurb text to the blurblist
			
			if (thisBlurbText.length == 1) {
				//blurbDisplaySingle.innerHTML = "<li>" + thisBlurbText; // bullet point version
				blurbDisplaySingle.innerHTML = "\"" + thisBlurbText[n] + "\"";
				
				// getting the hashName
				blurbDisplaySingle.innerHTML += "<br>" + thisBlurbHash[n];
			} else {
				
				if (n == 0) {
					thisBlurbDisplayFull.innerHTML = "";
				};
				
				if (thisBlurbHash[n] != "") {
					thisBlurbDisplayFull.innerHTML += "<li>" +"\"" + thisBlurbText[n] + "\"";
					thisBlurbDisplayFull.innerHTML += "\n\"" + thisBlurbHash[n] + "\"" + "</li>";
					
				} else {
					thisBlurbDisplayFull = blurbDisplayFullContd;
					thisBlurbDisplayFull.innerHTML = "";
					thisBlurbDisplayFull.innerHTML += "<li>" +"\"" + thisBlurbText[n] + "\"";
					thisBlurbDisplayFull.innerHTML += "</ul><ol>";
				};
			};
		};
		
		
	};
	
	if (document.getElementById("checkBlurb").checked) {
		blurbDisplayFull.style.display = 'list-item';
		blurbDisplayFullContd.style.display = 'list-item';
		blurbDisplaySingle.style.display = 'none';
	} else {
		blurbDisplaySingle.style.display = 'block';
		blurbDisplayFull.style.display = 'none';
		blurbDisplayFullContd.style.display = 'none';
	};
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

function getBlurbTextAndHash(thisBlurb , hashData , data , mode) {
	var thisBPaths = thisBlurb.branchPaths
	console.log("thisBPaths:");
	console.log(thisBPaths);
	
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
			if (thisName.search("Branch") == -1) {
				thisHash = thisHash.hashName;
				
				arrTexts.push(thisText);
				arrHashes.push(thisHash);
			} else {
					console.log("Additional branch at " + thisName);
					var additionalBranch = findInData(data.dialogItems, thisName);
					console.log(additionalBranch);
					
					var [additionalTexts , additionalHashes] = getBlurbTextAndHash(additionalBranch , hashData , data , "branch");
					console.log(additionalTexts);
					console.log(additionalHashes);
					
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
	while (document.getElementById("select" + (rowN + n) + "expert") != null) {
		for (var i = 0; i <= 1; i++) {
			// clearing dropdown of its children
			if (i == 0) {
				var type = "expert";
			} else {
				var type = "normal";
			};
			
			var thisSelect = document.getElementById("select" + (rowN + n) + type);
			if (thisSelect != null) {
				while (thisSelect.firstChild) {
					thisSelect.firstChild.remove()
				};
				
				thisSelect.style.display = 'none';
			};
			
		};
		
		n = n + 1
	};
	
	if (document.getElementById("blurbDisplaySingle") != null) {
		var blurbDisplaySingle = document.getElementById("blurbDisplaySingle");
		blurbDisplaySingle.style.display = 'none';
	};
	
	if (document.getElementById("blurbDisplayFull") != null) {
		var blurbDisplayFull = document.getElementById("blurbDisplayFull");
		blurbDisplayFull.style.display = 'none';
		var blurbDisplayFullContd = document.getElementById("blurbDisplayFullContd");
		blurbDisplayFullContd.style.display = 'none';
	};
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

//extracting number from between two square brackets
function numberFromBrackets(inputName) {
	inputName = inputName.slice(inputName.search("\\[")+1,inputName.search("\\]"))
	inputName = Number(inputName) //since we do math to this number later we need it as an explicit number
	return(inputName);
};

//extracting number from between an underscore and a period, ie DisConv_Blurb_14.1398 -> 14
function numberFromItem(inputName) {
	if (inputName.search("_") == -1) {
		inputName = 0;
	} else {
		inputName = inputName.slice(inputName.search("_")+1)
		if (inputName.search("_") == -1) {
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
			//wip: arrDisplayed for Boyle branches doesn't work correctly leading to error
			var prevVal = arrDisplayed[(arrDisplayed.length - 1)];
			
			//"Check: Is the player in the Golden Cat?" -> "Is the player in the Golden Cat"
			outputName = prevVal.slice(prevVal.search("Check: ")+7)
			outputName = outputName.replace("?","")
			
			// "Does the player know Lydia's identity?" -> "Player knows Lydia's identity"
			if (prevVal.search("know") != -1) {
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
	var thisDropdownID = "select" + rowN + type
	
	if (document.getElementById(thisDropdownID) != null) {
		var thisSelect = document.getElementById(thisDropdownID);
		clearFurtherDropdowns(rowN);
		thisSelect.style.display = 'block'; //wip: other styles?
	} else {
		var thisSelect = document.createElement("select");
		thisSelect.id = thisDropdownID;
		
		//making sure the blurblist stays at the bottom of all the dropdown menus
		if (document.getElementById("blurbDisplaySingle") != null) {
			document.body.insertBefore(thisSelect,document.getElementById("blurbDisplaySingle"));
		} else {
			document.body.appendChild(thisSelect);
		};
		thisSelect.style.display = 'block';
		
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
	var thisSelectNormal = buildThisDropdown("normal", rowN , data , hashData)
	var thisSelectExpert = buildThisDropdown("expert", rowN , data , hashData)
	
	// adding the default starting "option", which is blank and can't be selected again later
	var option = document.createElement("option");
	option.disabled = true;
	option.selected = true;
	if (rowN == 0) {
		option.text = "Dlg_HeartGadget";
	} else {
		option.text = "";
	};
	option.value = -1;
	thisSelectExpert.appendChild(option);
	
	var option = document.createElement("option");
	option.disabled = true;
	option.selected = true;
	if (rowN == 0) {
		option.text = "Dlg_HeartGadget";
	} else {
		option.text = "";
	};
	option.value = -1;
	thisSelectNormal.appendChild(option);
		
	// creating all dropdown options, which is the branchPathName and branchPathValue items of the item's branchPaths item
	// first row is different because it's actually still the starting item
	if (rowN == 0) {
		var thisItem = data.dialogItems[0]
		prevSelectVal = null
	} else {
		var prevSelect = document.getElementById("select" + (rowN - 1) + "expert");
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
			if (thisBranchPathValue.lastIndexOf("DisConv_Check",0) != 0) {
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
				if (thisItem.itemName.lastIndexOf("DisConv_Random",0) === 0) {
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
			
			
			var optionExpert = document.createElement("option");
			optionExpert.text = expertText;
			optionExpert.value = thisBranchPathValue;
			thisSelectExpert.appendChild(optionExpert);
			
			var optionNormal = document.createElement("option");
			optionNormal.text = normalText;
			optionNormal.value = thisBranchPathValue;
			thisSelectNormal.appendChild(optionNormal);
		};
	};
	
	if (prevSelectVal == "[Null]") {
		thisSelectExpert.style.display = 'none';
		thisSelectNormal.style.display = 'none';
	} else {
		if (document.getElementById("checkExpert").checked) {
			thisSelectExpert.style.display = 'block';
			thisSelectNormal.style.display = 'none';
		} else {
			thisSelectExpert.style.display = 'none';
			thisSelectNormal.style.display = 'block';
		};
	};
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

buildCollapsible("Start");
buildCollapsible("Classes");
buildCollapsible("Technical");
buildCollapsible("Other");



var arrDisplayed = new Array();
var currentDepth = 0;
//running everything
buildCheckBoxExpert();
buildCheckBoxBlurb();
//getting main JSON data
loadData().then(data => { 
	console.log(data);
	
	//getting hash JSON data
	loadHashData().then(hashData => { 
		console.log(hashData);
		
		buildDropdown(0 , data , hashData);
	});
});
