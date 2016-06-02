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


## Usage

``` ts
// main.ts - This code run's on the UI thread.
import { bootstrapRender } from '@angular/platform-browser';

require('angular-worker!./main.worker')(bootstrapRender /*, providers */);
```
> Don't forget to load all polyfills.
 

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

## License

MIT (http://www.opensource.org/licenses/mit-license.php)