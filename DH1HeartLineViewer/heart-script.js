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
function changeHandler(rowN , data , hashData) {
	var thisSelect = document.getElementById("select" + rowN);
	
	// hiding the blurb display
	if (document.getElementById("blurbDisplay") != null) {
		var blurbDisplay = document.getElementById("blurbDisplay");
		blurbDisplay.style.display = 'none';
	};
	
	if (thisSelect.value != "") {
		if (thisSelect.value.search("DisConv_Blurb") != -1) {
			buildBlurbDisplay(rowN + 1 , data , hashData);
		} else {
	    buildDropdown(rowN + 1 , data , hashData);
	  };
		
	};
	
};

function buildInfoText() {
	//info text
	var info = document.createElement("div");
	info.id = "info";
	document.body.appendChild(info);
	
	info.innerText = "The starting point of all Heart lines is the DisDialogTree type object Dlg_HeartGadget.Dlg_HeartGadget in Startup.upk"
	info.innerText += "\r\n"
	info.innerText += "\nAbout the start of the tree:"
	info.innerText += "\nDisDialogTree Dlg_HeartGadget.Dlg_HeartGadget has three conversation hooks which watch for inputs in order to fire dialogue."
	info.innerText += "\nDlg_HeartGadget.Dlg_HeartGadget.DisConv_DialogHook fires if this was a non-targeted, i.e. ambient, whisper."
	info.innerText += "\nDlg_HeartGadget.Dlg_HeartGadget.DisConv_Hook_HeartTargeted as well as DisConv_Hook_HeartTargeted_2 fire if this was a targeted whisper targeting an NPC. I'm not quite certain if the EDisDialogHook check is actually relevant, as both hooks have the exact same output branches - they both go to DisConv_SpeakerInStoryGroup. The following chain of checks first checks for unique NPCs, then, once all unique NPCs have been exhausted, for non-unique NPC groups. I get the feeling the devs initially wanted to check against the EDisDialogHook property to check whether unique or non-unique NPCs were being targeted but later decided to just run the same function in both cases."
	info.innerText += "\nThe latter two hooks are also used to fire off rat and riverkrust lines if those creatures are targeted." //wip: check if those are actually used
	info.innerText += "\r\n"
	info.innerText += "\nOn some of the item classes in this tree:"
	info.innerText += "\nDisConv_SequentialBranch: lines will always play sequentially, i.e. one after the other."
	info.innerText += "\nDisConv_RandomBranch: game chooses one out of the available branches at random using the specified numbers as each branch's chance."
	info.innerText += "\r\n"
	info.innerText += "\nTechnical information:"
	info.innerText += "\nThis site uses the UE Explorer naming convention of naming items \"[item name].[export table index]\", and of having zero-indexed items of a Class being named \"[Class]\" instead of \"[Class]_0\"."
	info.innerText += "\nThe drop-down menu items are formatted as [source] → [destination], with the destination being an object on the ExportTable and the source being a property of the object displayed as the destination in the previous dropdown."
	info.innerText += "\nText saying \"Play_...\" under voiceline text is the name of the audio file belonging to that line."
	info.innerText += "\r\n"
	info.innerText += "\nOther information:"
	info.innerText += "\nOne voiceline exists in Dlg_HeartGadget which isn't called by any branch of the dialogue tree. This voiceline is DisConv_Blurb_93 wth the text \"Callista. Yes, she is caretaker to the child.\". It most likely would have been part of DisConv_SequentialBranch_18, which is Callista's branch of targeted lines, and which conspicuously only has four lines in the final game where every other unique NPC has five."
	info.innerText += "\r\n"
	info.innerText += "\r\n"
	
	
};

function changeHandlerChk(strOrigin) {
	if (strOrigin == "expert") {
		var thisCheck = document.getElementById("checkExpert");
  } else { 
	  if (strOrigin == "blurb") {
		  var thisCheck = document.getElementById("checkBlurb");
	  };
	};
	
  checkValue = thisCheck.value;
  console.log(strOrigin);
  console.log(checkValue);
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
	lblBlurbDisplay.appendChild(document.createTextNode("BlurbDisplay"));
  document.body.appendChild(lblBlurbDisplay);
};

function buildBlurbDisplay(rowN, data, hashData) {
	// making sure there aren't any more dropdowns below the blurblist
	clearFurtherDropdowns(rowN);
	
	// getting or building the blurblist element
	if (document.getElementById("blurbDisplay") != null) {
		var blurbDisplay = document.getElementById("blurbDisplay");
	} else {
		var blurbDisplay = document.createElement("ul");
		blurbDisplay.id = "blurbDisplay";
		document.body.appendChild(blurbDisplay);
	};
	
	//getting the blurb text
	var thisSelect = document.getElementById("select" + (rowN - 1));
	var thisBlurb = findInData(data.dialogItems,thisSelect.value)
	var thisBlurbText = thisBlurb.branchPaths[0].branchPathValue
	
	// adding the blurb text to the blurblist
	var blurbDisplay = document.getElementById("blurbDisplay")
	//blurbDisplay.innerHTML = "<li>" + thisBlurbText; // bullet point version
  blurbDisplay.innerHTML = "\"" + thisBlurbText + "\"";
	
	// getting the hashName
  blurbDisplay.innerHTML += "<br>" + findInHashData(hashData.hashItems, thisBlurb.itemName).hashName
  blurbDisplay.style.display = 'block';
};


// clearing all further dropdowns as well as removing the blurblist from view when an earlier dropdown is changed
function clearFurtherDropdowns(rowN) {
	var n = 0
	while (document.getElementById("select" + (rowN + n)) != null) {
		// clearing dropdown of its children
		var thisSelect = document.getElementById("select" + (rowN + n));
		while (thisSelect.firstChild) {
			thisSelect.firstChild.remove()
		};
		
		thisSelect.style.display = 'none';
		
		n = n + 1
	};
	
	if (document.getElementById("blurbDisplay") != null) {
		var blurbDisplay = document.getElementById("blurbDisplay");
    blurbDisplay.style.display = 'none';
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
};

//wip: fix [Null] branches
function buildDropdown(rowN , data , hashData) {
  // getting or building this drop-down menu
	if (document.getElementById("select" + rowN) != null) {
		var thisSelect = document.getElementById("select" + rowN);
		clearFurtherDropdowns(rowN);
		thisSelect.style.display = 'block'; //wip: other styles?
	} else {
		var thisSelect = document.createElement("select");
		thisSelect.id = "select" + rowN;
		
		//making sure the blurblist stays at the bottom of all the dropdown menus
		if (document.getElementById("blurbDisplay") != null) {
  		document.body.insertBefore(thisSelect,document.getElementById("blurbDisplay"));
		} else {
  		document.body.appendChild(thisSelect);
		};
		thisSelect.style.display = 'block';
		
		// adding the event listener to run things when the value fo this dropdown changes
		thisSelect.addEventListener("change", function() { 
			changeHandler(rowN , data , hashData) 
			});
	
	};
	
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
	thisSelect.appendChild(option);
		
	// creating all dropdown options, which is the branchPathName and branchPathValue items of the item's branchPaths item
	// first row is different because it's actually still the starting item
	if (rowN == 0) {
		var thisItem = data.dialogItems[0]
	} else {
		var prevSelect = document.getElementById("select" + (rowN - 1));
		// looking for the previous dropdown's value in the data array
		var thisItem = findInData(data.dialogItems, prevSelect.value)
	};
	
	// actually creating the dropdown options
	for (var n = 0; n < thisItem.branchPaths.length; n++) {
		var option = document.createElement("option");
		var thisBranch = thisItem.branchPaths[n]
		var thisBranchPathName = thisBranch.branchPathName
		var expertText = thisBranchPathName + " → " + thisBranch.branchPathValue;
		
		// normal text 
	  var normalText = "wip"
		if (thisBranch.branchPathFriendlyName != null) {
	  	normalText = thisBranch.branchPathFriendlyName;
	  } else {
			if (thisBranchPathName.search("m_OutputLinks") != -1) {
	    	normalText = "Output link " + thisBranchPathName.slice(thisBranchPathName.search("\\[")+1,thisBranchPathName.search("\\]"));
			} else {
				if (thisBranchPathName.search("m_Branches") != -1) {
					normalText = "Branch " + thisBranchPathName.slice(thisBranchPathName.search("\\[")+1,thisBranchPathName.search("\\]"));
				} else {
					normalText = thisBranchPathName;
				};
			};
		};
		
		normalText = normalText + " → "

		// special: checkstoryflags
		if (thisBranch.branchPathValue.lastIndexOf("DisConv_Check",0) === 0) {
			var storyflagItem = findInData(data.dialogItems, thisBranch.branchPathValue)
			expertText = expertText + " (checked StoryFlag: " + storyflagItem.checkedStoryFlag + ")"
		};

		// special: conditions
		if (thisBranch.branchPathCondition != null) {
			var conditionVal = thisBranch.branchPathCondition
			if (thisItem.itemName.lastIndexOf("DisConv_Random",0) === 0) {
				expertText = expertText + " (" + conditionVal + "% chance)"
			} else {
				expertText = expertText + " (if " + conditionVal + ")"
			};
		};
		
		checkExpert = document.getElementById("checkExpert");
		if (checkExpert.checked == true) {
	  	option.text = expertText;
		} else {
	  	option.text = expertText;
	  	//option.text = normalText;
		};
		
		arrDisplayedExpert.push(expertText);
		arrDisplayedNormal.push(normalText);
		
		option.value = thisBranch.branchPathValue;
		thisSelect.appendChild(option);
	};
	
};

//storage array that store what's currently displayed
var arrDisplayedExpert = new Array();
var arrDisplayedNormal = new Array();
arrDisplayedExpert.push("A");

//running everything
buildInfoText();
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

