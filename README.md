# :package: Package Explorer
A web-based tool for browsing the contents of `/var/lib/dpkg/status` found on Ubuntu/Debian systems.

Package Explorer is hosted here: https://lit-dusk-04630.herokuapp.com/
* [How do I use it?](#boy-usage)

It is a solution to a [pre-assignment](https://www.reaktor.com/junior-dev-assignment/) for a job at Reaktor.
* [Why does the solution looks like this?](#construction_worker-implementation)

## :boy: Usage

You can upload your own `/var/lib/dpkg/status` using a form at the top of the page. Don't worry, it doesn't get sent anywhere! It is processed directly in your browser. If you don't have a `/var/lib/dpkg/status` file and just want to see how the app works, you can use the `Submit mock file` button.

After processing, all packages in the file are shown as buttons on the main page. When you click one, you will see information about it:

![screenshot](../assets/screenshot.PNG)

* All dependencies are clickable and take you to information about the dependency package.

* Reverse dependencies are packages that depend on the current package.

* Button which are close together form a *group*. Only one package from a group is required for the current package to work.

* Button `debconf-2.0` in the screenshot above is inactive and that means that `debconf-2.0` is not installed.

## :construction_worker: Implementation

*Write a small program in a programming language of your choice that exposes some key information about packages in the file via an HTML interface.*

* The file is small enough to be handled in memory and there is no need to persist any of it on disk as it is always uploaded again in one piece. This is a good reason to **keep processing fully on the client** and restrain from sending any data to the server. It makes for:
  * Faster, more secure user experience
  * Simpler system design

* This leads us to the use of the **Single-Page Application (SPA)** paradigm where we don't even need to send page requests to the server (except for the initial one). This allows for cleaner code separation between different parts of the app.

* Package Explorer is written in **React/Node.js** using the [Create React App](https://create-react-app.dev/) module. React and node.js are widely used (at Reaktor, among others :wink: ), so they are well supported. The Create React App is then very easy and fast to use on simple apps such as this one.

* **Bootstrap** is added on top to make things simple but pretty.

### :european_castle: Architecture

*The main design goal of this program is maintainability.*

* The app can be naturally split into two separate modules:
  * **Parser** ([`parser.js`](../master/src/back_end/parser.js))
  * **User Interface** ([`App.js`](../master/src/front_end/App.js))

* These are connected by a data-handling module ([`data.js`](../master/src/back_end/data.js)). Its purpose is to load file content either from user upload or from a server-stored mock file, have the parser process it and return it back to the user interface in a suitable data structure (aka The Map):

```
Map(
  "tzdata": {
    description: "time zone and daylight-saving time data...",
    dependencies: [
      [{ name: "debconf", installed: true }, { name: "debconf-2.0", installed: false }],
    ],
    reverseDependencies: [
      [{ name: "libc6", installed: true }],
      [{ name: "tzdata-java", installed: true }],
      ...
    ]
  },
  "sudo": {
    ...
  },
  ...
)
```

* Package names are unique, so they can serve as good hash map keys (at least when working with single files). Hash maps in general are great for fast element access which is what we need when the user navigates between packages and when computing **reverse dependencies**. The ES6 [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object can also be sorted which is useful for displaying packages in **alphabetical order**.

* Dependencies are stored in nested array because it makes them easier to render in groups which contain alternate dependencies.

### :factory: Parser

*The section [Syntax of control files](https://www.debian.org/doc/debian-policy/ch-controlfields.html) of the Debian Policy Manual applies to the input data.*
* A set of **unit tests** ([`parser.test.js`](../master/src/back_end/parser.test.js)) was written before the parser itself to test for each aspect of the syntax definition.
* The parser has to expose private functions so that they can be tested. This drawback is outweighed by the fact that there can be fewer tests and that each test can directly address a specific aspect of the syntax definition. It also opens the possibility for the parser code to be shaped by the structure of the tests which is a good thing because the tested behaviour is really what we want.

### :computer: User Interface

*The index page lists installed packages alphabetically with package names as links.*
* Each package is a button, so that a large list of packages doesn't take up too much space and so that packages are easy to click.
* This list of buttons is fed from `App.state.packageNames` state variable which contains keys of the (alphabetically ordered) [Map](#european_castle-architecture) and is updated whenever a new file is loaded.

*When following each link, you arrive at a piece of information about a single package.*
* Information is shown in a [modal](https://getbootstrap.com/docs/4.0/components/modal). This way everything can be kept in a single page and the (potentially very large) list of packages doesn't have to re-render every time the user click a package (as it would when, say, a collapsible was opened).
* The modal is fed from `App.state.currentPackageInfo` state variable. This variable is updated from the [Map](#european_castle-architecture) whenever a button is clicked and the modal shows only when the variable changes.

*The dependencies and reverse dependencies should be clickable and the user can navigate the package structure by clicking from package to package.*
* All the package buttons in the modal need to do is to have a callback which updates `App.state.currentPackageInfo` accordingly.

### :hammer: Extensions/Improvements

TODO
