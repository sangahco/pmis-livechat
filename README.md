# It's Live Chat!

Before doing anything else make sure you have these applications:

- [npm](https://nodejs.org/it/download/)
  > This is used for running **bower** and downloading required libraries

- [git](https://git-scm.com/downloads)
  > This is the SVN used for downloading and updating this repository

**`npm` and `git` are required during development only, they are not used in production!**


## 1. Get this source

```
$ git clone https://github.com/sangahco/pmis-livechat.git
```

## 2. Run the application

Go inside the new folder and execute these commands from a console:


```
$ git submodule update
$ npm install -g bower-installer
$ npm install
$ npm start
```

``npm install`` will install the necessary modules, ``bower`` and ``bower-installer``
and will prepare the root folder with necessary dependencies.

``git submodule update`` will retrieve some AngularJS commons libraries from our git repository
used by this application.

The following folders will be created under the root folder:

- node_modules (*only development*)
  > Used in order to run bower, but not required in production.

- bower_components (*only development*)
  > Used by bower to take libraries, used only when you prepare the folder, not required to run the application.

- libs
  > Contains the libraries required by the application (jquery,bootstrap,angular).

## 3. Distribute the Client source for production

You can test the code typing on a terminal the following command, in order to build the javascript files,
then make sure you go on the next point to start it:

```
$ npm install -g grunt
$ npm install --only=dev
$ npm run publish
```

A new `dist` folder will be created with all the files required to run the client side.