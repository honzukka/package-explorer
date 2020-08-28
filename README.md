# Package Explorer
A web-based tool for browsing the contents of `/var/lib/dpkg/status` found on Ubuntu/Debian systems.

Package Explorer is hosted here: https://lit-dusk-04630.herokuapp.com/
* [How do I use it?](#usage)

It is a solution to a [pre-assignment](https://www.reaktor.com/junior-dev-assignment/) for a job at Reaktor.
* [Why does the solution looks like this?](#design-decisions)

## Usage

You can upload your own `/var/lib/dpkg/status` using a form at the top of the page. Don't worry, it doesn't get sent anywhere! It is processed directly in your browser. If you do not have a `/var/lib/dpkg/status` file and just want to see how the app works, you can use the `Submit mock file` button.

After processing, all packages in the file are shown as buttons on the main page. When you click one, you will see some information about it:

![screenshot](../assets/screenshot.PNG)

* All dependencies are clickable and take you to information about the dependency package.
* Reverse dependencies are packages that depend on the current package.
* Button which are close together form a *group*. Only one package from a group is required for the current package to work.
* Button `debconf-2.0` in the screenshot above is inactive and that means that `debconf-2.0` is not installed.

## Implementation
