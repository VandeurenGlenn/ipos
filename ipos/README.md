# ipos
```
ipos => desktop => programs => view
```
## Features
- Login everywhere, anywhere
- Integrated package manager for users & developers
- Secure data system with user permissions
- Cryptocurrency wallet

## User
### Directory Structure
```
user
  - secure => user protected data
  - public => public data
    - documents 
    - pictures
    - music
    - ... 
  - local => local machine data
    - documents
    - pictures
    - music
    - ... 
```
#### User protected data
Permisson or password is needed to unlock user protected data
```
user
  - secure
    - picture
    - documents
    - music
    - ... => user defined folders
  - ...
```

#### Local Data
Local data can be accessed from your other machines, you can also enable sync in ipos-explorer so data gets synced on each device (selectable by file). 

#### Public Data
Public data or linked data from local, public available on ipfs for everyone (check the world section in ipos-explorer).

## Programs (apps)
Programs/apps should work everywhere, therefore only javascript is supported for now (or forever)

A program should extend on the BaseProgram class for basic window and keyboard specific methods
In short extending the BaseProgram class gives you access to basic methods like hide, show, close, ontop, etc
Remember, every program/app is an system level program/app, this means you'r just limited with wath js can do.

### Sidenotes
Everything that gets writen to ipfs or local is encrypted by default,<br>
user sensitive data is stored into `user/secure`

When developing a program please try avoiding npm and use ipm instead, so packages are installed in the `system/packages` directory.

### Directory structure
```
program
  - src/index.js => ES6 Module
  - index.js => bundled commonjs
  - package.json => program info
```

### Writing a program (app)
A program/app is an js class with some minor base properties & methods

> note: system is globally available in ipos so don't forget to import ipos-system when using your app/element somewhere else.

```js

// define program
system.define(class MyProgram extends system.Program {
  constructor() {
    super();
    this.icon = 'my-cool-program-icon';
    this.name = 'my-cool-program-name';
    this.shortname = 'mcpn';
  }
  get template() {
    return html`
      <style> 
        :host {
          ...
        }
      </style>
      <p>...</p>
      <slot></slot>
    `;
  }
  
  hello() {
    return console.log('hello');
  }
})

// Program api (standard)
MyProgram.hide()
MyProgram.show()
MyProgram.close()
MyProgram.resize(width, height)
MyProgram.chromeLess // set to true to use your own close, mini/maximize, etc buttons
MyProgram.icon = 'icon' // set icon
MyProgram.name = 'program' // set name, when none set, defaults to className
MyProgram.shortname = 'p' // set shortname, when none set, defaults to className
MyProgram.startUp.add() // adds the program to the startup list
MyProgram.startUp.remove() // removes the program from the startup list
// MyProgram.start()

// MyProgram api
MyProgram.hello()
```
### IPOS Explorer
```
explorer
  - local => your local data
  - public => your public data
  - world => Exploreable data from other ipos users (be carefull best run in ipos-vm when something executable)
```

### IPOS Program Manager (IPM)
A package manager that resolves programs from `ipfs, npm, yarn, git & urls`,<br>

packages are added into the `system/packages` directory until the program is installed,
you can keep the packages by using the `--dev` flag.<br>
otherwise the program gets installed and the source files will be deleted (if any).

You can find installed programs in the `system/programs` directory.

#### Options
```
- add <package> <FLAGS> => add to packages & install when --dev flag is unused
- remove => removes program & packages (if any)
- install <package> => installs package from source
- uninstall <package> => uninstall program but keep packages (if any)
```

### IPOS Store
IPOS store contains know installable programs, programs not included are searched for on `npm, yarn`, you can also intall from url.

The store extends on IPM and includes all developer focused features (install and start hacking!)

#### FLAGS
```
--dev => keep packages for development
```
## TODO
- [ ] replace npm with ipm
