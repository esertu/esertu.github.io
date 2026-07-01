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
	
	if (document.getElementById("blurbList") != null) {
		var blurbList = document.getElementById("blurbList");
		blurbList.style.display = 'none';
	};
	
	if (thisSelect.value != "") {
		if (thisSelect.value.search("DisConv_Blurb") != -1) {
			buildBlurblist(rowN + 1 , data , hashData);
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
	info.innerText += "\nDlg_HeartGadget.Dlg_HeartGadget.DisConv_Hook_HeartTargeted fires if this was a targeted whisper targeting a unique NPC."
	info.innerText += "\nDlg_HeartGadget.Dlg_HeartGadget.DisConv_Hook_HeartTargeted_2 fires if this was a targeted whisper targeting a non-unique NPC."
	info.innerText += "\nThe latter two hooks are also used to fire off rat and riverkrust lines if those creatures are targeted."
	info.innerText += "\r\n"
	info.innerText += "\nAbout some of the items:"
	info.innerText += "\nDisConv_SequentialBranch: lines will always play sequentially, i.e. one after the other."
	info.innerText += "\nDisConv_RandomBranch: game chooses one out of the available branches at random using the specified numbers as each branch's chance."
	info.innerText += "\r\n"
	info.innerText += "\r\n"
	
	
};

function buildBlurblist(rowN, data, hashData) {
	// making sure there aren't any more dropdowns below the blurblist
	clearFurtherDropdowns(rowN);
	
	// getting or building the blurblist element
	if (document.getElementById("blurbList") != null) {
		var blurbList = document.getElementById("blurbList");
	} else {
		var blurbList = document.createElement("ul");
		blurbList.id = "blurbList";
		document.body.appendChild(blurbList);
	};
	
	//getting the blurb text
	var thisSelect = document.getElementById("select" + (rowN - 1));
	var thisBlurb = findInData(data.dialogItems,thisSelect.value)
	var thisBlurbText = thisBlurb.branchPaths[0].branchPathValue
	
	// adding the blurb text to the blurblist
	var blurbList = document.getElementById("blurbList")
	//blurbList.innerHTML = "<li>" + thisBlurbText; // bullet point version
  blurbList.innerHTML = "\"" + thisBlurbText + "\"";
	
	// getting the hashName
  blurbList.innerHTML += "<br>" + findInHashData(hashData.hashItems, thisBlurb.itemName).hashName
  blurbList.style.display = 'block';
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
	
	if (document.getElementById("blurbList") != null) {
		var blurbList = document.getElementById("blurbList");
    blurbList.style.display = 'none';
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

function buildDropdown(rowN , data , hashData) {
  // getting or building this drop-down menu
	if (document.getElementById("select" + rowN) != null) {
		var thisSelect = document.getElementById("select" + rowN);
		if (rowN != 0) {
			clearFurtherDropdowns(rowN);
		};
		thisSelect.style.display = 'block'; //wip: other styles?
	} else {
		var thisSelect = document.createElement("select");
		thisSelect.id = "select" + rowN;
		
		//making sure the blurblist stays at the bottom of all the dropdown menus
		if (document.getElementById("blurbList") != null) {
  		document.body.insertBefore(thisSelect,document.getElementById("blurbList"));
		} else {
  		document.body.appendChild(thisSelect);
		};
		thisSelect.style.display = 'block';
		
		// adding the event listener to run things when the value fo this dropdown changes
		thisSelect.addEventListener("change", function() { 
			changeHandler(rowN , data , hashData) 
			});
	
	};
	
	if (rowN != 0) {
		// adding the default starting "option", which is blank and can't be selected again later
	 var option = document.createElement("option");
		option.disabled = true;
		option.selected = true;
	  if (rowN == 1) {
		  option.text = "Dlg_HeartGadget";
		} else {
		  option.text = "";
		};
		option.value = -1;
		thisSelect.appendChild(option);
	};
	
		
	// first row is different because it's the starting item
	if (rowN == 0) {
	  // creating the first row dropdown option, which is the itemName of the starting item
	  var option = document.createElement("option");
		option.text = data.dialogItems[0].itemName;
		option.value = data.dialogItems[0].itemName;
	  thisSelect.appendChild(option);
		
	// creating all other row dropdown options, which is the branchPathName and branchPathValue items of the item's branchPaths item
	} else {
	// second row is different because it's actually still the starting item
		if (rowN == 1) {
			var thisItem = data.dialogItems[0]
		} else {
			var prevSelect = document.getElementById("select" + (rowN - 1));
			console.log("prevSelect:");
			console.log(prevSelect);
			console.log(prevSelect.value);
			// looking for the previous dropdown's value in the data array
			var thisItem = findInData(data.dialogItems, prevSelect.value)
		};
		
		// actually creating the dropdown options
		for (var n = 0; n < thisItem.branchPaths.length; n++) {
			var option = document.createElement("option");
			var thisBranch = thisItem.branchPaths[n]
			option.text = thisBranch.branchPathName + ": " + thisBranch.branchPathValue;

			// special: checkstoryflags
			if (thisBranch.branchPathValue.lastIndexOf("DisConv_Check",0) === 0) {
		  	var storyflagItem = findInData(data.dialogItems, thisBranch.branchPathValue)
				option.text = option.text + " (checked SF: " + storyflagItem.checkedStoryFlag + ")"
			};

			// special: conditions
			if (thisBranch.branchPathCondition != null) {
		  	var conditionVal = thisBranch.branchPathCondition
				if (thisItem.itemName.lastIndexOf("DisConv_Random",0) === 0) {
				  option.text = option.text + " (" + conditionVal + "% chance)"
				} else {
				  option.text = option.text + " (if " + conditionVal + ")"
				};
			};
			
			option.value = thisBranch.branchPathValue;
			thisSelect.appendChild(option);
		};
	};
	
};


//running everything
//getting main JSON data
buildInfoText();
loadData().then(data => { 
  console.log(data);
	
  //getting hash JSON data
	loadHashData().then(hashData => { 
		console.log(hashData);
		
		buildDropdown(0 , data , hashData);
		buildDropdown(1 , data , hashData);
	});
});
