
History
-------


3.0.1 (2015-04-05)
++++++++++++++++++

- refactor extension and fix bugs
- detect python binary from common locations for Windows
- alert if python not found


3.0.0 (2015-04-01)
++++++++++++++++++

- fix keypress listener
- add WakaTime menu item to change api key


2.0.4 (2015-04-01)
++++++++++++++++++

- only unbind previous event listener when view is not null


2.0.3 (2015-04-01)
++++++++++++++++++

- add missing file from wakatime package


2.0.2 (2015-04-01)
++++++++++++++++++

- fix prompt for API key
- upgrade external wakatime package to v4.0.6


2.0.1 (2015-03-26)
++++++++++++++++++

- support for Komodo 9
- upgrade external wakatime package to v4.0.4
- new options for excluding and including directories
- use requests library instead of urllib2, so api SSL cert is verified
- new proxy config file item for https proxy support
- detect frameworks from JavaScript and JSON files
- detect JavaScript frameworks from script tags in Html template files
- remove unused dependency, which is missing in some python environments
- ignore errors from malformed markup (too many closing tags)


2.0.0 (2014-12-23)
++++++++++++++++++

- upgrade external wakatime package to v3.0.1
- detect libraries and frameworks for C++, Java, .NET, PHP, and Python files


1.0.7 (2014-12-22)
++++++++++++++++++

- upgrade external wakatime package to v2.1.11
- fix bug in offline logging when no response from api


1.0.6 (2014-11-18)
++++++++++++++++++

- upgrade external wakatime package to v2.1.6
- fix list index error when detecting subversion project


1.0.5 (2014-11-12)
++++++++++++++++++

- upgrade external wakatime package to v2.1.4
- when Python was not compiled with https support, log an error to the log file


1.0.4 (2014-11-10)
++++++++++++++++++

- upgrade external wakatime package to v2.1.3
- correctly detect branch for subversion projects


1.0.3 (2014-09-30)
++++++++++++++++++

- upgrade external wakatime package to v2.1.1
- fix bug where binary file opened as utf-8


1.0.2 (2014-09-30)
++++++++++++++++++

- upgrade external wakatime package to v2.1.0
- python3 compatibility changes


1.0.1 (2014-07-25)
++++++++++++++++++

- upgrade external wakatime package to v2.0.5
- use unique logger namespace to prevent collisions in shared plugin environments
- option in .wakatime.cfg to obfuscate file names


1.0.0 (2014-06-23)
++++++++++++++++++

- Birth

