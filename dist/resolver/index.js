"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const l = debug('resolve');
const ts = require("typescript");
/**
 * ts 自身实现了类似node的resolver,但是增加了d.ts等类型的搜索
 */
function tsReolveOptions(options) {
    options.optionsTsconfig = options.optionsTsconfig || {};
    const host = ts.createCompilerHost(Object.assign({}, options.optionsTsconfig, { moduleResolution: ts.ModuleResolutionKind.NodeJs }));
    l('----tsResolveOptions', options);
    const resolvedModule = ts.resolveModuleName(options.moduleName, options.containlingFile, Object.assign({}, options.optionsTsconfig, { moduleResolution: ts.ModuleResolutionKind.NodeJs }), host).resolvedModule;
    l('ts resolved module: ', resolvedModule);
    return resolvedModule;
}
exports.tsReolveOptions = tsReolveOptions;
function jsResolveOptions(options) {
    let paths = {};
    const { alias } = options;
    const host = ts.createCompilerHost({
        allowJs: true,
    });
    if (alias) {
        Object.keys(alias).forEach((path) => {
            paths[path + '/*'] = [alias[path] + '/*'];
        });
    }
    l('paths', paths);
    const { moduleName, containlingFile } = options;
    const resolvedModule = ts.resolveModuleName(moduleName, containlingFile, {
        allowJs: true,
        baseUrl: '.',
        paths,
    }, host).resolvedModule;
    return resolvedModule;
}
exports.jsResolveOptions = jsResolveOptions;
