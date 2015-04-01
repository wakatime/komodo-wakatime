var komodoWakatime = {

    VERSION: '2.0.4',

    heartbeatFrequency: 2,
    lastHeartbeatTime: 0,
    lastHeartbeatFile: null,
    currentView: null,
    currentFile: null,
    keyPressListener: null,
    apiKey: null,
    prefName: 'wakatime_api_key',
    prefs: Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs,

    onLoad: function (thisObject) {
        window.WakaTime = thisObject;
        thisObject.getApiKey();
        if (!thisObject.apiKey) thisObject.saveApiKey(thisObject.promptApiKey());
        thisObject.initViewListener(thisObject);
    },
    log: function(msg) {
        ko.logging.getLogger('WakaTime').warn(msg);
    },
    apiClientLocation: function () {
        var currProfPath = Components.classes["@mozilla.org/file/directory_service;1"]
          .getService(Components.interfaces.nsIProperties)
          .get("PrefD", Components.interfaces.nsILocalFile)
          .path;
        var plugin_dir = currProfPath + '/extensions/wakatime@wakatime.com';
        return plugin_dir + '/components/wakatime/cli.py';
    },
    getApiKey: function () {
        if (this.apiKey) return this.apiKey;
        if (this.prefs.hasStringPref(this.prefName)) this.apiKey = this.prefs.getStringPref(this.prefName);
        return this.apiKey;
    },
    saveApiKey: function (key) {
        if (key) {
            this.apiKey = key;
            this.prefs.setStringPref(this.prefName, this.apiKey);
        }
    },
    promptApiKey: function () {
        return ko.dialogs.prompt("Enter your wakatime.com api key:", 'WakaTime API Key', this.getApiKey());
    },
    getFileName: function (thisObject) {
        return thisObject.currentFile;
    },
    enoughTimePassed: function (thisObject) {
        var d = new Date();
        if ((d.getTime() - thisObject.lastHeartbeatTime) > thisObject.heartbeatFrequency * 60000) {
            return true;
        }
        return false;
    },
    fileHasChanged: function (thisObject) {
        if (thisObject.currentFile !== thisObject.lastHeartbeatFile) {
            return true;
        }
        return false;
    },
    watchView: function (thisObject, view) {
        if (view !== null) {
            if (thisObject.currentView !== null && thisObject.keyPressListener !== null) {
                thisObject.currentView.removeEventListener('keypress', thisObject.keyPressListener, true);
            }
            thisObject.keyPressListener = function (event) {
                thisObject.keyPressEvent(thisObject, event);
            };
            thisObject.currentView = view;
            thisObject.currentView.addEventListener('keypress', thisObject.keyPressListener, true);
        }
    },
    sendDataToApi: function (thisObject, writeFlag) {
        writeFlag = typeof writeFlag !== 'undefined' ? writeFlag : false;
        var cmdWriteFlag = writeFlag ? '--write' : '';
        var fileName = thisObject.getFileName(thisObject);
        var cmd = 'python ' +
          thisObject.apiClientLocation().replace(/(@)/g, "\\@").replace(/(\s)/g, "\\ ") +
          ' ' + cmdWriteFlag + ' --file ' + fileName + ' --plugin komodo-wakatime/'+ thisObject.VERSION +
          ' --key ' + thisObject.getApiKey();
        var runSvc = Components.classes["@activestate.com/koRunService;1"]
          .createInstance(Components.interfaces.koIRunService);
        var process = runSvc.RunAndNotify(cmd, '', '', '');

        thisObject.lastHeartbeatFile = fileName;
        var d = new Date();
        thisObject.lastHeartbeatTime = d.getTime();
    },
    initViewListener: function (thisObject) {
        var view = ko.views.manager.currentView || thisObject.currentView;
        thisObject.watchView(thisObject, view);
    },
    keyPressEvent: function (thisObject) {
        if (thisObject.enoughTimePassed(thisObject) || thisObject.fileHasChanged(thisObject)) {
            thisObject.sendDataToApi(thisObject);
        }
    },
    fileSavedEvent: function (thisObject) {
        thisObject.sendDataToApi(thisObject, true);
    },
    fileChangedEvent: function (thisObject, event) {
        thisObject.currentFile = event.originalTarget.koDoc.file.displayPath;
        var view = event.originalTarget || ko.views.manager.currentView || thisObject.currentView;
        thisObject.watchView(thisObject, view);
    },
};

window.addEventListener('file_saved', function (event) {
    komodoWakatime.fileSavedEvent(komodoWakatime, event);
}, false);
window.addEventListener('current_view_changed', function (event) {
    komodoWakatime.fileChangedEvent(komodoWakatime, event);
}, true);
window.addEventListener('komodo-ui-started', function (event) {
    komodoWakatime.onLoad(komodoWakatime, event);
}, true);
