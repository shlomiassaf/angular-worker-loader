# Angular 2 web worker loader for webpack

## Why Loader?
A Web Worker is loaded by providing a worker script
``` javascript
new Worker('myscript.js');
```

Angular 2 is slightly different, we will not deal with the `Worker` type directly but still we need to supply a URI to the worker script.

In angular 2 loading a web worker application is done by splitting the bootstrap phase into 2 parts.  
The 1st phase requires a worker script, the worker script (and imports) is what actually runs in the worker thread.  
Having a URI as an entry point presents a problem in webpack due to it's architecture, to allow the use of a URI we need to play along and use webpack tools.  

## Install
```
npm install angular-worker-loader --save-dev
```

## Usage

Boilerplate type overhead for demo purposes, see shorter demo below.

``` ts
// main.ts - This code run's on the UI thread.
// Don't forget to load polyfills before.
import { ApplicationRef } from '@angular/core';
import { bootstrapRender } from '@angular/platform-browser';

// The shape of the returned function.
interface WebpackBootstrapFactory {
  (bsRender: typeof bootstrapRender, customProviders?: Array<any>): Promise<ApplicationRef>; 
}

const bootstrap: WebpackBootstrapFactory = require('angular-worker!./main.worker')
let appRefPromise: Promise<ApplicationRef> = bootstrap(bootstrapRender /*, [ customProviders ] */);
```
Require the worker file (the entry point to run in a worker), the return type is a wrapper function around the original angular `bootstrapRender`. Invoke the function, supplying the original `bootstrapRender` and optional providers.
 


``` ts
// main.worker.ts - This code run's on the worker thread.
import { bootstrapApp } from '@angular/platform-browser';
import { App } from './app';
 
// Load 3rd party (vendor) code in the entry point (webpack config) inside of the worker...

bootstrapApp(App, [ /* Application providers */ ]);
```
> Don't forget to load all polyfills. The previous polyfills were loaded in a different context.
   

## TODO

 * Workflow with bundles, especially hashed.
 * Integrate with the HTML plugin. (exclude vendors)
 * Webpack optimizations, de duplications, etc...


### Example with the deprecated router
``` ts
import { bootstrapRender, WORKER_RENDER_LOCATION_PROVIDERS } from '@angular/platform-browser';

require('bootstrapApp!./main.ww.browser')(bootstrapRender, [ WORKER_RENDER_LOCATION_PROVIDERS ] );
```
 

``` ts
import { bootstrapApp, WORKER_APP_LOCATION_PROVIDERS } from '@angular/platform-browser';
import { App } from './app';
 
// Load 3rd party (vendor) code in the entry point (webpack config) inside of the worker...

bootstrapApp(App, [ WORKER_APP_LOCATION_PROVIDERS ]);
```

## Compare with a non webpack setup

#### main.ts
**angular-loader:**
``` ts
import { bootstrapRender } from '@angular/platform-browser';
require('angular-worker!./main.worker')(bootstrapRender);
```
**Non webpack:**
``` ts
import { bootstrapRender } from '@angular/platform-browser';
bootstrapRender('main.worker.js');
```

#### main.worker.ts
**angular-loader:**
``` ts
import { bootstrapApp } from '@angular/platform-browser';
import { App } from './app';
bootstrapApp(App, [ /* Application providers */ ]);
```

**Non webpack:**
No change!

The only difference is a revised bootstrapRender invocation.

## Credits 
Heavily based on [worker-loader](https://github.com/webpack/worker-loader)
## License

MIT (http://www.opensource.org/licenses/mit-license.php)