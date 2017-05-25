var komodoWakatime = {

  VERSION: '3.0.6',

  heartbeatFrequency: 2,
  prefName: 'wakatime_api_key',

  lastHeartbeatTime: 0,
  lastHeartbeatFile: null,
  prefs: Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs,

  onLoad: function(event) {
    window.WakaTime = this;
    if (!this.getPythonBinary()) {
      ko.dialogs.alert('Unable to find Python binary. Please install Python or add Python to your PATH if already installed, then restart Komodo.', null, 'WakaTime Error');
    } else {
      if (!this.isValidApiKey(this.getApiKey())) this.saveApiKey(this.promptApiKey());
      this.setupListeners();
    }
  },
  error: function(msg) {
    ko.logging.getLogger('WakaTime').error(msg);
  },
  warn: function(msg, level) {
    ko.logging.getLogger('WakaTime').warn(msg);
  },
  getPythonBinary: function() {
    if (this._pythonLocation) return this._pythonLocation;
    var locations = [
      'pythonw',
      'python',
      '/usr/local/bin/python',
      '/usr/bin/python',
    ];
    for (var i=40; i>=26; i--) {
      locations.push('\\python' + i + '\\pythonw');
      locations.push('\\Python' + i + '\\pythonw');
    }
    for (var i=0; i<locations.length; i++) {
      var cmd = [this.escapePath(locations[i]), '--version'];
      var stdout = {};
      var stderr = {};
      var context = this;
      var process = Components.classes["@activestate.com/koRunService;1"].getService(Components.interfaces.koIRunService);
      var result = process.RunAndCaptureOutput(cmd.join(' '), '', '', '', stdout, stderr);
      if (result == 0) {
        this._pythonLocation = locations[i];
        return this._pythonLocation;
      }
    }
    return undefined;
  },
  getWakaTimeCLI: function() {
    if (this._wakatimeCLI) return this._wakatimeCLI;
    var currProfPath = Components.classes["@mozilla.org/file/directory_service;1"]
      .getService(Components.interfaces.nsIProperties)
      .get("PrefD", Components.interfaces.nsILocalFile)
      .path;
    var plugin_dir = currProfPath + '/extensions/wakatime@wakatime.com';
    var cli = plugin_dir + '/components/wakatime/cli.py';
    this._wakatimeCLI = cli;
    return cli;
  },
  getApiKey: function() {
    if (this._apiKey) return this._apiKey;
    if (this.prefs.hasStringPref(this.prefName)) this._apiKey = this.prefs.getStringPref(this.prefName);
    return this._apiKey;
  },
  saveApiKey: function(key) {
    if (key) {
      this._apiKey = key;
      this.prefs.setStringPref(this.prefName, this._apiKey);
    }
  },
  promptApiKey: function() {
    return ko.dialogs.prompt("Enter your wakatime.com api key:", 'WakaTime API Key', this.getApiKey());
  },
  isValidApiKey: function(key) {
    if (!key) return false;
    var re = new RegExp('^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$', 'i');
    return re.test(key);
  },
  getCurrentFile: function() {
    var currentView = ko.views.manager.currentView;
    if (currentView) {
      return currentView.koDoc.displayPath;
    }
    return undefined;
  },
  enoughTimePassed: function() {
    var d = new Date();
    if ((d.getTime() - this.lastHeartbeatTime) > this.heartbeatFrequency * 60000) {
      return true;
    }
    return false;
  },
  hasFileChanged: function(currentFile) {
    if (currentFile && currentFile !== this.lastHeartbeatFile) {
      return true;
    }
    return false;
  },
  escapePath: function(arg) {
    return '"' + arg.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + '"';
  },
  sendHeartbeat: function(currentFile, isWrite) {
    this.escapePath(this.getPythonBinary());
    this.escapePath(this.getWakaTimeCLI());
    this.escapePath(currentFile);
    this.escapePath('komodo-wakatime/' + this.VERSION);
    var cmd = [
      this.escapePath(this.getPythonBinary()),
      this.escapePath(this.getWakaTimeCLI()),
      '--entity',
      this.escapePath(currentFile),
      '--plugin',
      this.escapePath('komodo-wakatime/' + this.VERSION),
      '--key',
      this.escapePath(this.getApiKey()),
    ];
    if (isWrite) cmd.push('--write');

    var context = this;
    var process = Components.classes["@activestate.com/koRunService;1"].getService(Components.interfaces.koIRunService);
    var result = process.RunAsync(cmd.join(' '), function() { context.sent.apply(context, arguments); }, '', '', '');

    this.lastHeartbeatFile = currentFile;
    var d = new Date();
    this.lastHeartbeatTime = d.getTime();
  },
  sent: function(cmd, code, stdout, stderr) {
    if (code !== 0) {
      if (code === 104) {
        ko.dialogs.alert('Your api key is invalid.', 'WakaTime Error');
        this.saveApiKey(this.promptApiKey());
      } else if (code !== 102 && code !== 103 && !this._errorShown) {
        ko.dialogs.alert('Exit Status: ' + code, stdout + stderr, 'WakaTime Error');
        this._errorShown = true;
      }
      this.warn(cmd);
      this.warn('Process exit code nonzero: ' + code);
      if (stdout) this.warn(stdout);
      if (stderr) this.warn(stderr);
    }
  },
  setupListeners: function() {
    var context = this;
    window.addEventListener('file_saved', function(event) {
      context.fileSavedEvent.apply(context, [event]);
    }, false);
    window.addEventListener('current_view_changed', function(event) {
      context.fileChangedEvent.apply(context, [event]);
    }, true);
    var view = ko.views.manager.currentView || this._currentView;
    this.watchView(view);
  },
  watchView: function(view) {
    if (view !== null) {
      var context = this;
      if (this._currentView !== null && this._keyPressListener !== undefined) {
        this._currentView.removeEventListener('keypress', this._keyPressListener, true);
      }
      this._keyPressListener = function(event) {
        context.keyPressEvent(event);
      };
      this._currentView = view;
      this._currentView.addEventListener('keypress', this._keyPressListener, true);
    }
  },
  keyPressEvent: function() {
    var currentFile = this.getCurrentFile();
    if (currentFile && (this.enoughTimePassed() || this.hasFileChanged(currentFile))) {
      this.sendHeartbeat(currentFile);
    }
  },
  fileSavedEvent: function() {
    var currentFile = this.getCurrentFile();
    if (currentFile) {
      this.sendHeartbeat(currentFile, true);
    }
  },
  fileChangedEvent: function(event) {
    var view = event.originalTarget || ko.views.manager.currentView || this._currentView;
    this.watchView(view);
  },
};

window.addEventListener('komodo-post-startup', komodoWakatime.onLoad.bind(komodoWakatime));
