WAZNIYA Web Wallet
======================

[![License](https://img.shields.io/badge/license-EUPL--1.2-red)](https://opensource.org/licenses/EUPL-1.2)

### Info

1. Downloads
2. Requirements & Install Locations

### Contributing and Testing

1. Getting the Source Code
2. Repo Contents Overview
3. Building for Production
4. Running in Development Mode
5. Acknowledgements

## Downloads

Download the latest version from our website at [wazniya.com](https://wazniya.com) or from the Releases tab.

Developers and pre-release testers who would like to use and work on the app can run it by obtaining the source and running one of the build commands below.

To get set up with the source code, please see **Getting the Source Code** below.

### Where is user data saved?

* Browser: None (no data is saved)

## Getting the Source Code

### Download & Install

1. First, ensure that you have recent versions of `node` and `npm` installed.

2. Clone or otherwise download this repository. Then, in your terminal, `cd` into the repo directory.

3. (To get the bleeding edge, and/or if you are going to make changes) Switch to the `develop` branch by executing `git checkout develop`.

4. Install all required `node_modules` by executing `npm install`.

## Repo Contents Overview
* Local, application source code is located in `local_modules/`. This includes bundled/static third-party "Vendor" libraries such as [EmojiOne](http://emojione.com).

* After installation, non-bundled third-party modules will be located in `node_modules/`.

* App package and build process info is located in `package.json`.

* This readme is located at `README.md`, and the license is located at `LICENSE.txt`.

## Building for Production

If you want to run the browser build which is provided in the releases, simply unzip it, `cd` into the browser_build directory, then run `python -m SimpleHTTPServer 9100` (replacing the port with one of your choice if needed). Then, open your browser of choice and navigate to `http://localhost:9100`.

### Browser (Web wallet)

`npm run start`

*Note:* This will run the command `python -m SimpleHTTPServer 9100` to serve `./browser_build`. After this command completes, open your browser of choice and navigate to `http://localhost:9100`.

### Developing

If you have an improvement to the codebase and would like to have your code shipped in the production Wazniya app, please submit a [pull request](https://help.github.com/articles/about-pull-requests/), even if it's still a WIP. We try to credit all contributors in app release notes.

* Merging PRs which involve integrating with any third-party services will require discussion and agreement.  

* We reserve the right to refuse to merge any PRs, such as those which introduce breaking changes.

The maintainer enjoys collaborating with volunteer contributors to the Wazniya apps over IRC private message and the #wazniya room on freenode.net (Come say hello!), so PR'd submissions do not have to be at all complete or perfect on their first submission. (To submit a draft PR for review, simply mark it as '[DO NOT MERGE]')

There's also an icebox of ideas, features, improvements, known issues, and other todos waiting to be knocked out which are kept in the [Issues](https://github.com/wazniya/wazniya-app-js/issues) tracker.

### Donating

Wazniya Donation Address (XMR): 424iT6SuWnXSMHDYYs3chNTFm5n1GnCBzQj9ce5CHxiUWzoXU9MZS9hZb5xYQ7bFZVKZMXo7m8jYihYXznJ2iwf46zRNb6M

Proceeds from donations are used to fund development on the Wazniya back-end server (a performant version of which we soon™ plan to open-source for anyone to run their own server at home). Any remaining funds will go towards product (app UI) R&D, and hosting costs.

## Acknowledgements

Contributors to each release are credited in release notes.

## Authors, Contributors, and Advisors

* 🍄 `vermin` ([vermin](https://github.com/vermin)) Wazniya Lead Maintainer & Core developer

## License
```
Licensed under the EUPL-1.2
Copyright (c) 2020-2021 Wazniya
Copyright (c) 2014-2019 MyMonero
```
