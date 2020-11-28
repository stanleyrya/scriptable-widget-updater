const scripts = [{
    type: 'raw',
    name: 'interest-map',
    raw: 'https://raw.githubusercontent.com/bring-larry-to-life/scriptable-widget-interest-map/main/widget.js',
    forceDownload: true,
    storedParameters: {"apiKey": "testtest"}
}]

for (const script of scripts) {
    if (script.storedParameters) {
        const writeSuccess = writeStoredParameters(script.name, script.storedParameters)
        console.log("Attempted to write parameters for script. Success?: " + writeSuccess);
    }
    await download(script);
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

async function download(script) {
    switch(script.type) {
        case 'raw':
            await downloadScript(script);
            break;
        default:
            console.error("Cant interpret type. Not downloading file.");
    }
}

/**
 * Downloads script file if forced or not yet existing.
 *
 * @param {{name: string, raw: string, forceDownload: bool}} script 
 */
async function downloadScript(script) {
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
        console.log("Not downloading script")
    } else {
        console.log("Downloading script '" + script.raw + "' to '" + path + "'")
        const req = new Request(script.raw)
        let scriptFile = await req.load()
        fm.write(path, scriptFile)
    }

    return script.name + '.js'
}
