// Heavily based on https://github.com/webpack/worker-loader/blob/master/index.js

const path = require("path"),
      WebWorkerTemplatePlugin = require("webpack/lib/webworker/WebWorkerTemplatePlugin"),
      SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin"),
      loaderUtils = require("loader-utils");

module.exports = function() {};

module.exports.pitch = function(request) {
    if(!this.webpack) throw new Error("Only usable with webpack");

    this.cacheable(false);

  const callback = this.async(),
        query = loaderUtils.parseQuery(this.query),
        filename = loaderUtils.interpolateName(this, query.name || "[hash].worker.js", {
            context: query.context || this.options.context,
            regExp: query.regExp
        }),
        outputOptions = {
            filename: filename,
            chunkFilename: "[id]." + filename,
            namedChunkFilename: null
        };

    if(this.options && this.options.worker && this.options.worker.output) {
        for(var name in this.options.worker.output) {
            outputOptions[name] = this.options.worker.output[name];
        }
    }

    const workerCompiler = this._compilation.createChildCompiler("worker", outputOptions);
    workerCompiler.apply(new WebWorkerTemplatePlugin(outputOptions));
    workerCompiler.apply(new SingleEntryPlugin(this.context, "!!" + request, "main"));

    if(this.options && this.options.worker && this.options.worker.plugins) {
        this.options.worker.plugins.forEach(function(plugin) {
            workerCompiler.apply(plugin);
        });
    }

    const subCache = `subcache ${__dirname} request`;

    workerCompiler.plugin("compilation", function(compilation) {
        if(compilation.cache) {
            if(!compilation.cache[subCache])
                compilation.cache[subCache] = {};
            compilation.cache = compilation.cache[subCache];
        }
    });

    workerCompiler.runAsChild(function(err, entries, compilation) {
        if(err) return callback(err);

        if (entries[0]) {
          const factoryCode = getFactoryCode(entries[0].files[0]);
          return callback(null, `module.exports = ${factoryCode};`);
        } else {
            return callback(null, null);
        }
    });
};

function getFactoryCode(workerFile) {
  return `function(bootstrapRender, providers) {
    return bootstrapRender(__webpack_public_path__ + ${JSON.stringify(workerFile)}, providers);
  }\n`
}
