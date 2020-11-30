const scripts = [{
    type: 'raw',
    name: 'interest-map',
    raw: 'https://raw.githubusercontent.com/bring-larry-to-life/scriptable-widget-interest-map/main/widget.js',
    forceDownload: false,
    storedParameters: {"apiKey": "testtest"}
},{
    type: 'raw',
    name: 'busyness-calendar',
    raw: 'https://raw.githubusercontent.com/stanleyrya/scriptable-widget-busyness-calendar/main/widget.js',
    forceDownload: false,
    storedParameters: {"monthDiff": -1}
}]

async function update() {
  let results = {
      "updated": 0,
      "failed": 0,
      "off": 0
  };
  for (const script of scripts) {
    if (script.storedParameters) {
        const writeSuccess = writeStoredParameters(script.name, script.storedParameters)
        console.log("Attempted to write parameters for script. Success?: " + writeSuccess);
    }
    const scriptResults = await download(script);
    
    if (scriptResults.updated) { results.updated++; }
    if (scriptResults.failed) { results.failed++; }
    if (scriptResults.off) { results.off++; }
  }
  return results;
}

/**
 * Attempts to write the file ./storage/name.json
 * Returns false if it cannot be written.
 */
function writeStoredParameters(name, params) {
    let fm = FileManager.local()

    const thisScriptPath = module.filename
    const storageDir = thisScriptPath.replace(fm.fileName(thisScriptPath, true), '') + "storage"
    const parameterFile = name + ".json";
    const parameterPath = storageDir + "/" + parameterFile;

    if (!fm.fileExists(storageDir)) {
        console.log("Storage folder does not exist! Creating now.");
        fm.createDirectory(storageDir);
    } else if (!fm.isDirectory(storageDir)) {
        console.error("Storage folder exists but is not a directory!");
        return false;
    }

    if (fm.fileExists(parameterPath) && fm.isDirectory(parameterPath)) {
        console.error("Parameter file is a directory, please delete!");
        return false;
    }

    fm.writeString(parameterPath, JSON.stringify(params))

    return true;
}

/**
 * Downloads script using different logic depending on the type.
 *
 * @param {{type: string, name: string, raw: string, forceDownload: bool}} script 
 * results: { "updated": true, "failed": true, "off": true }
 */
async function download(script) {
    switch(script.type) {
        case 'raw':
            return await downloadScript(script);
        default:
            console.error("Cant interpret type. Not downloading file.");
            return { "failed": true };
    }
}

/**
 * Downloads script file if forced or not yet existing.
 *
 * @param {{name: string, raw: string, forceDownload: bool}} script 
 * results: { "updated": true, "failed": true, "off": true }
 */
async function downloadScript(script) {
    try {
        let fm = FileManager.local()
    
        let thisScriptPath = module.filename;
        let scriptDirectory = thisScriptPath.replace(fm.fileName(thisScriptPath, true), '');
        let scriptFilename = script.name + '.js';
        let path = fm.joinPath(scriptDirectory, scriptFilename);
        let forceDownload = (script.forceDownload) ? script.forceDownload : false;
    
        console.log("thisScriptPath: " + thisScriptPath)
        console.log("scriptDirectory: " + scriptDirectory)
        console.log("scriptFilename: " + scriptFilename)
        console.log("path: " + path)
        console.log("forceDownload: " + forceDownload)
    
        if (fm.fileExists(path) && !forceDownload) {
            console.log("Not downloading script");
            return { "off": true }
        } else {
            console.log("Downloading script '" + script.raw + "' to '" + path + "'")
            const req = new Request(script.raw)
            let scriptFile = await req.load()
            fm.write(path, scriptFile)
        }
    
        return { "updated": true };
    } catch (err) {
        console.error(err);
        return { "failed": true };
    }
}

// Takes in an object that describes the update script's results:
// { "updated": 3, "failed": 4, "off": 1 }
async function createWidget(results) {
    let widget = new ListWidget();

    let startColor = new Color("#1c1c1c00");
    let endColor = new Color("#1c1c1cb4");
    let gradient = new LinearGradient();
    gradient.colors = [startColor, endColor];
    gradient.locations = [0.25, 1];
    widget.backgroundGradient = gradient;
    widget.backgroundColor = new Color("1c1c1c");

    let titleStack = widget.addStack();
    titleStack.layoutHorizontally();

    let titleText = titleStack.addText("Widget Updater");
    titleText.textColor = Color.white();
    titleText.leftAlignText();
    
    titleStack.addSpacer();
    
    let iconText = titleStack.addText("📲");
    iconText.font = Font.largeTitle();
    iconText.leftAlignText();
    
    widget.addSpacer();

    if (results.updated) {
        writeLine(widget, "✅ " + results.updated + " updated");
    }
    if (results.failed) {
        writeLine(widget, "⚠️ " + results.failed + " failed");
    }
    if (results.off) {
        writeLine(widget, "⏸ " + results.off + " off");
    }

    widget.addSpacer();

    let lastUpdatedDate = widget.addDate(new Date());
    lastUpdatedDate.applyTimeStyle();
    lastUpdatedDate.font = Font.thinMonospacedSystemFont(10);
    lastUpdatedDate.textColor = Color.white();
    lastUpdatedDate.rightAlignText();

    return widget;
}

function writeLine(widget, text) {
    let textObject = widget.addText(text);
    textObject.font = Font.thinMonospacedSystemFont(12);
    textObject.textColor = Color.white();
    textObject.leftAlignText();
}

async function run(params) {
    const results = await update();
	if (config.runsInWidget) {
	    const widget = await createWidget(results)
	    Script.setWidget(widget)
	    Script.complete()

	// Useful for loading widget and seeing logs manually
    } else {
	    const widget = await createWidget(results)
	    await widget.presentSmall()
	}
}

await run();
