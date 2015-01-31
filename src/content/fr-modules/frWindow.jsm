var EXPORTED_SYMBOLS = [
	"createFloatWindow",
	"createSideBar",
	"removeSideBar",
	"copyWindowContent"
];

Components.utils.import("chrome://firerobot/content/fr-modules/utils.jsm");
Components.utils.import("chrome://firerobot/content/fr-modules/select.jsm");
Components.utils.import("chrome://firerobot/content/fr-modules/variables.jsm");

function createFloatWindow() {
	var floatWindow = windowWatcher.openWindow(null,
		"chrome://firerobot/content/fireRobotWindow.xul",
		"firerobot", "chrome, resizable", null);
	floatWindow.addEventListener('load', function() {
		floatWindow.document.getElementById("closeButton").setAttribute("hidden", "true");
		floatWindow.document.getElementById("windowModeButton").setAttribute("class",
			"btn sideBarButton");
		floatWindow.addEventListener('close', function() {
			_closeFRWindow();
		}, false);
	}, true);
	return floatWindow;
}

function createSideBar() {
	var ffWindow = windowMediator.getMostRecentWindow("navigator:browser");
	if (!ffWindow) {
		warning("firerobot.warn.no-window");
		return;
	}

	var oldWindow = Application.storage.get("browserWindow", undefined);
	if (oldWindow != ffWindow) {
		setBrowserIconOff(oldWindow);
		setBrowserIconOn(ffWindow);
		Application.storage.set("browserWindow", ffWindow);
	}
	var document = ffWindow.document;
	var frContainer = document.getElementById("browser");
	Application.storage.set("frContainer", frContainer);

	var frSplitter = document.createElement('splitter');
	frSplitter.setAttribute("orient", "horizontal");
	frSplitter.innerHTML = "<grippy/>";
	frSplitter.setAttribute("collapse", "after");
	Application.storage.set("frSplitter", frSplitter);

	var frBox = document.createElement('vbox');
	frBox.setAttribute("width", "520rem");
	Application.storage.set("frBox", frBox);

	var frBrowser = document.createElement('browser');
	frBrowser.setAttribute("flex", "2");
	frBrowser.setAttribute("src",
		"chrome://firerobot/content/fireRobotWindow.xul");
	frBrowser.setAttribute("disablehistory", "true");
	//frBrowser.setAttribute("collapsed", "true");
	frBrowser.setAttribute("persist", "height,width");
	Application.storage.set("frBrowser", frBrowser);

	frBox.appendChild(frBrowser);

	frContainer.insertBefore(frSplitter, null);
	frContainer.insertBefore(frBox, null);

	var sideBar = frBrowser.contentDocument.defaultView ||
		frBrowser.contentDocument.parentWindow;

	Application.storage.set("sideBar", sideBar);

	sideBar.addEventListener('load', function() {

		sideBar.document.getElementById("closeButton").setAttribute("hidden", "false");

		sideBar.document.getElementById("windowModeButton").setAttribute("class",
			"btn floatButton");
	}, true);
	return sideBar;
}

function removeSideBar() {
	var frBrowser = Application.storage.get("frBrowser", undefined);
	if (frBrowser) {
		frBrowser.contentDocument.defaultView.close();
		frBrowser.parentNode.removeChild(frBrowser);
	}
	var frBox = Application.storage.get("frBox", undefined);
	if (frBox) {
		frBox.parentNode.removeChild(frBox);
	}
	var frSplitter = Application.storage.get("frSplitter", undefined);
	if (frSplitter) {
		frSplitter.parentNode.removeChild(frSplitter);
	}
	Application.storage.set("frBrowser", undefined);
	Application.storage.set("frBox", undefined);
	Application.storage.set("frSplitter", undefined);
	Application.storage.set("frContainer", undefined);
}

function copyWindowContent(oldWindow, newWindow) {
	newWindow.document.getElementById("htmlTextArea").value = oldWindow.
	document.getElementById("htmlTextArea").value;
	newWindow.document.getElementById("settingsTextArea").value = oldWindow.
	document.getElementById("settingsTextArea").value;
	newWindow.document.getElementById("testCaseTextArea").value = oldWindow.
	document.getElementById("testCaseTextArea").value;
	newWindow.document.getElementById("keywordsTextArea").value = oldWindow.
	document.getElementById("keywordsTextArea").value;
	newWindow.document.getElementById("selectButton").setAttribute("class",
		oldWindow.document.getElementById("selectButton").getAttribute("class"));
	newWindow.document.getElementById("playButton").setAttribute("class",
		oldWindow.document.getElementById("playButton").getAttribute("class"));
	newWindow.document.getElementById("testTabBox").selectedIndex = oldWindow.
	document.getElementById("testTabBox").selectedIndex;

	Application.storage.set("frWindow", newWindow);

	var rows = oldWindow.document.getElementById("varListBox").childNodes;

	for (var i = 0; i < rows.length; i++) {
		addVariable(rows[i].childNodes[1].value, rows[i].childNodes[3].value);
	}
}

function _closeFRWindow() {
	resetSelectContext();
	var browserWindow = Application.storage.get("browserWindow", undefined);
	setBrowserIconOff(browserWindow);
	Application.storage.set("frWindow", undefined);
	Application.storage.set("testFile", undefined);
}