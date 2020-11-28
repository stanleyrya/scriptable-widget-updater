const scripts = [{
    name: 'interest-map',
    raw: 'https://raw.githubusercontent.com/bring-larry-to-life/scriptable-widget-interest-map/main/widget.js',
    forceDownload: true
}]

for (const script of scripts) {
    await downloadScript(script)
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
