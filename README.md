# :package: Package Explorer
A web-based tool for browsing the contents of `/var/lib/dpkg/status` found on Ubuntu/Debian systems.

Package Explorer is hosted here: https://lit-dusk-04630.herokuapp.com/
* [How do I use it?](#boy-usage)
* [How do I build it locally?](#construction-building)

It is a solution to a [pre-assignment](https://www.reaktor.com/junior-dev-assignment/) for a job at Reaktor.
* [Why does the solution look like this?](#construction_worker-implementation)

## :boy: Usage

You can upload your own `/var/lib/dpkg/status` using a form at the top of the page. Don't worry, it doesn't get sent anywhere! It is processed directly in your browser. If you don't have a `/var/lib/dpkg/status` file and just want to see how the app works, you can use the `Submit mock file` button.

After processing, all packages in the file are shown as buttons on the main page. When you click one, you will see information about it:

![screenshot](../assets/screenshot.PNG)

* All dependencies are clickable and take you to information about the dependency package.

* Reverse dependencies are packages that depend on the current package.

* Buttons which are close together form a *group*. Only one package from a group is required for the current package to work.

* Button `debconf-2.0` in the screenshot above is inactive and that means that `debconf-2.0` is not installed. That's okay because it's in a group with `debconf` which is installed.

## :construction: Building

1. Make sure you have a recent version of [Node.js](https://nodejs.org) installed.

2. Run `npm install` in the root of the repository to install dependencies.

3. Run `npm start` to serve the app locally.

4. Done!

## :construction_worker: Implementation

***Write a small program in a programming language of your choice that exposes some key information about packages in the file via an HTML interface.***

* The file is small enough to be handled in memory and there is no need to persist any of it on disk as it is always uploaded again in one piece. This is a good reason to **keep processing fully on the client** and restrain from sending any data to the server. It makes for:
  * Faster, more secure user experience
  * Simpler system design

* This leads us to the use of the **Single-Page Application (SPA)** paradigm where we don't even need to send page requests to the server (except for the initial one). This allows for cleaner code separation between different parts of the app. The Progressive Web App (PWA) paradigm could also be used to enable a fully offline mode, but it's better to keep things simple for now.

* Package Explorer is written in **React/Node.js** using the [Create React App](https://create-react-app.dev/) module. React and Node.js are widely used, so they are well supported. Create React App is then very easy and fast to use on simple SPA apps such as this one.

* **Bootstrap** is added on top to make things pretty.

### :european_castle: Architecture

***The main design goal of this program is maintainability.***

* The app can be naturally split into two separate modules:
  * **Parser** ([`parser.js`](../master/src/back_end/parser.js))
  * **User Interface** ([`App.js`](../master/src/front_end/App.js))

* These are connected by a data-handling module ([`data.js`](../master/src/back_end/data.js)). Its purpose is to load file content, have the parser process it and then return it back to the user interface in a suitable data structure (aka The Map):

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

* Hash maps are great for fast element access which is what we need when the user navigates between packages and when computing **reverse dependencies**. The ES6 [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object can also be sorted which is useful for displaying packages in **alphabetical order**. As for keys, package names can be used because they are unique (at least as long as we're working with single files).

* Dependencies are stored in a nested array because it makes them easier to render in groups which contain alternate dependencies.

### :factory: Parser

***The section [Syntax of control files](https://www.debian.org/doc/debian-policy/ch-controlfields.html) of the Debian Policy Manual applies to the input data.***

* A set of **unit tests** ([`parser.test.js`](../master/src/back_end/parser.test.js)) was written before the parser itself to test for each aspect of the syntax definition.

* The parser has to expose private functions so that they can be tested. This drawback is outweighed by the fact that there can be fewer tests and that each test can directly address a specific aspect of the syntax definition.

### :computer: User Interface

***The index page lists installed packages alphabetically with package names as links.***

* Each package is a button, so that a large list of packages doesn't take up too much space and so that packages are easy to click.

* This list of buttons is fed from `App.state.packageNames` state variable which contains the keys of the (alphabetically ordered) [Map](#european_castle-architecture) and is updated whenever a new file is loaded.

***When following each link, you arrive at a piece of information about a single package.***

* Information is shown in a [modal](https://getbootstrap.com/docs/4.0/components/modal). This way everything can be kept in a single page and the (potentially very large) list of packages doesn't have to re-render every time the user click a package (as it would when, say, a collapsible was opened).

* The modal is fed from `App.state.currentPackageInfo` state variable. This variable is updated from the [Map](#european_castle-architecture) whenever a button is clicked and the modal shows only when the variable changes.

***The dependencies and reverse dependencies should be clickable and the user can navigate the package structure by clicking from package to package.***

* All the package buttons in the modal need to do is to have a callback which updates `App.state.currentPackageInfo` accordingly.

### :warning: Error Handling

There are two main sources of exceptions in the app:

* File loading

* Parsing

The main principle applied here is to **catch exceptions early** and propagate the error message in a controlled way all the way to [`App.js`](../master/src/front_end/App.js) which decides how to let the user know that an error has occured. [`parser.js`](../master/src/back_end/parser.js) and [`data.js`](../master/src/back_end/data.js) shouldn't touch the user interface in any way.

For example, when the parser encounters an unexpected value, such as a missing package field, the following happens:

* The private method in [`parser.js`](../master/src/back_end/parser.js) that encountered the error throws an exception.

* The public method in [`parser.js`](../master/src/back_end/parser.js) responsible for file parsing catches it and returns the error message instead of parsed data.

* [`data.js`](../master/src/back_end/data.js) sees that no data was parsed and returns a [Map](#european_castle-architecture) containing a single package called "#error" (no package can have this name because such a value would be interpreted as a comment) with the error message as its data.

* [`App.js`](../master/src/front_end/App.js) sees the "#error" package, shows an `alert()` to the user and doesn't update the state.

### :scroll: Summary

![schema](../assets/schema.svg)

This highly non-standard diagram aims to summarize the main components of the app and the data flow. The three colorful curves represent how the app reacts to user input:

1. User uploads a file -> File is parsed and a list of packages is shown

2. User clicks on a package in the package list -> Current package info is updated and a package view is shown.

3. User clicks on a dependency in the package view -> Current package info is updated and a package view is shown.

### :hammer: Extensions

The [assignment page](https://www.reaktor.com/junior-dev-assignment/) mentions possible extensions to the app. Here is how they could be implemented in this design:

***Add the possibility to add notes to individual packages.***

* The [Map](#european_castle-architecture) would be updated to include a [note] field for each package: `"sudo": { description: "...", dependencies: [...], reverseDependencies: [...], note: "..." }`.

* The modal component would be extended by a text box which would have a callback to update the [Map](#european_castle-architecture).

***Add the possibility to add tags to individual packages and the possibility to filter with tags.***

* A new Map of tags would be added to the state: `Map( "tag1": [ "sudo", "tzdata" ], "tag2": [ "tzdata" ], ... )`.
  * This data structure would make it very easy to filter by tags and also to add to multiple tags to a single package.

* The modal component would be extended by a subcomponent for adding tags that would have a callback for updating the new Map.

* A new list of tags would be shown above the list of packages on the main page (fed by the new Map). Upon clicking a tag, `App.state.packageNames` would simply be updated by indexing into the new Map. That would automatically filter the package list.

***The notes and tags must be persisted in such a way that they are not lost on reboot etc.***

* **Assumption:** The intended use case is to browse only through packages on the current machine.
  * This needs to be handled carefully because such a feature could evolve into great complexity if we considered that users might want to manage their `/var/lib/dpkg/status` files across multiple machines, share them with friends, like, subscribe...
  * In the absence of a client to clarify this point, an assumption will have to suffice.

* Persisting notes and tags on a single machine may be done with offline storage such as [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) and thus sending data to the server can still be avoided. Since IndexedDB storage is tied to the browser, it might be reasonable to offer the option to download/upload notes and tags from a file, so that true persistance could be achieved.

* To save current state (regardless of the persistance method used), [`data.js`](../master/src/back_end/data.js) can expose a function `save()` to [`App.js`](../master/src/front_end/App.js) which would be triggered after every tag/note update in the user interface.

* To load a state, [`data.js`](../master/src/back_end/data.js) would load both the file and the notes/tags, it would throw away notes/tags which do not match any package (perhaps because the package has been uninstalled) and combine this data together before passing it to [`App.js`](../master/src/front_end/App.js).

* To summarize, all that is needed to be done in [`App.js`](../master/src/front_end/App.js) is to trigger the `save()` method after every update. Everything else can be handled in [`data.js`](../master/src/back_end/data.js).
