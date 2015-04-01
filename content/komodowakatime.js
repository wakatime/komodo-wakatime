var komodoWakatime = {

    VERSION: '2.0.3',

    action_frequency: 2,
    time: 0,
    api_key: '',
    view: null,
    fileName: '',
    keyPressListener: null,

    onLoad: function (thisObject) {
        var prefs = Components.classes['@activestate.com/koPrefService;1']
          .getService(Components.interfaces.koIPrefService)
          .prefs;
        var pref_name = 'wakatime_api_key';
        if (!prefs.hasStringPref(pref_name) || prefs.getStringPref(pref_name) === '') {
            thisObject.api_key = thisObject.promptForAPIKey();
            prefs.setStringPref('wakatime_api_key', thisObject.api_key);
        } else {
            thisObject.api_key = prefs.getStringPref(pref_name);
        }
        komodoWakatime.initViewListener(komodoWakatime);
    },
    log: function(msg) {
        ko.logging.getLogger('').warn(msg);
    },
    apiClientLocation: function () {
        var currProfPath = Components.classes["@mozilla.org/file/directory_service;1"]
          .getService(Components.interfaces.nsIProperties)
          .get("PrefD", Components.interfaces.nsILocalFile)
          .path;
        var plugin_dir = currProfPath + '/extensions/wakatime@wakatime.com';
        return plugin_dir + '/components/wakatime/cli.py';
    },
    promptForAPIKey: function () {
        return ko.dialogs.prompt("[WakaTime] Enter your wakatime.com api key:");
    },
    getFileName: function (thisObject) {
        return thisObject.fileName;
    },
    enoughTimePassed: function (thisObject) {
        var d = new Date();
        if ((d.getTime() - thisObject.time) > thisObject.action_frequency * 60000) {
            thisObject.time = d.getTime();
            return true;
        }
        return false;
    },
    sendDataToAPI: function (thisObject, writeFlag) {
        writeFlag = typeof writeFlag !== 'undefined' ? writeFlag : false;
        var cmdWriteFlag = writeFlag ? '--write' : '';
        var fileName = thisObject.getFileName(thisObject);
        var cmd = 'python ' +
          thisObject.apiClientLocation().replace(/(@)/g, "\\@").replace(/(\s)/g, "\\ ") +
          ' ' + cmdWriteFlag + ' --file ' + fileName + ' --plugin komodo-wakatime/'+ thisObject.VERSION +
          ' --key ' + thisObject.api_key;
        var runSvc = Components.classes["@activestate.com/koRunService;1"]
          .createInstance(Components.interfaces.koIRunService);
        var process = runSvc.RunAndNotify(cmd, '', '', '');
    },
    keyPressEvent: function (thisObject) {
        if (thisObject.enoughTimePassed(thisObject)) {
            thisObject.sendDataToAPI(thisObject);
        }
    },
    fileSaveEvent: function (thisObject) {
        thisObject.sendDataToAPI(thisObject, true);
    },
    initViewListener: function (thisObject) {
        thisObject.keyPressListener = function (event) {
            thisObject.keyPressEvent(thisObject, event);
        };
        if (thisObject.view !== null) {
            thisObject.view.removeEventListener('keypress', thisObject.keyPressListener, true);
        }
        if (ko.views.manager.currentView !== null) {
            thisObject.view = ko.views.manager.currentView;
            thisObject.view.addEventListener('keypress', thisObject.keyPressListener, true);
        }
    },
    fileChanged: function (thisObject, event) {
        thisObject.fileName = event.originalTarget.koDoc.file.displayPath;
        thisObject.keyPressListener = function (event) {
            thisObject.keyPressEvent(thisObject, event);
        };
        ko.views.manager.currentView.removeEventListener('keypress', thisObject.keyPressListener, true);
        thisObject.view = event.originalTarget;
        thisObject.view.addEventListener('keypress', thisObject.keyPressListener, true);
    }
};

window.addEventListener('file_saved', function (event) {
    komodoWakatime.fileSaveEvent(komodoWakatime, event);
}, false);
window.addEventListener('current_view_changed', function (event) {
    komodoWakatime.fileChanged(komodoWakatime, event);
}, true);
window.addEventListener('komodo-ui-started', function (event) {
    komodoWakatime.onLoad(komodoWakatime, event);
}, true);
