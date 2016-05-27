komodo-wakatime
===============

Quantify your coding inside Komodo with http://wakatime.com/.


Features
--------

* Detects project name from revision control software. (ex: git, subversion, mercurial)
* Language breakdown showing your most-used programming languages.
* Monthly, weekly, or daily email summaries.
* See logged time per project or branch.

Installation
------------

1. Inside Komodo, navigate to `Tools` -> `Add-ons`.
2. Press the left arrow key to go up one level.
3. Search for `WakaTime` and press `Enter` to install.
4. When prompted, click `Restart Now`.
5. Enter your [api key](https://wakatime.com/settings#apikey).
6. Use Komodo and your time will be tracked for you automatically.
7. Visit https://wakatime.com to see your logged time.

Screen Shots
------------

![Project Overview](https://wakatime.com/static/img/ScreenShots/Screen-Shot-2016-03-21.png)


Troubleshooting
---------------

Open your log file `Help -> Troubleshooting -> View Log File` and look for WakaTime related error messages.

Also, [turn on debug mode][troubleshooting] then tail your `$HOME/.wakatime.log` file to debug wakatime cli problems.

For more general troubleshooting information, see [wakatime/wakatime#troubleshooting][troubleshooting].


[troubleshooting]: https://github.com/wakatime/wakatime#troubleshooting
