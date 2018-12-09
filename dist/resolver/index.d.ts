import * as ts from 'typescript';
export interface ItsOptions {
    moduleName: string;
    containlingFile: string;
    optionsTsconfig?: ts.CompilerOptions;
}
export interface IjsOptions {
    moduleName: string;
    containlingFile: string;
    alias: {
        [key: string]: string;
    } | undefined;
}
/**
 * ts 自身实现了类似node的resolver,但是增加了d.ts等类型的搜索
 */
export declare function tsReolveOptions(options: ItsOptions): ts.ResolvedModuleFull | undefined;
export declare function jsResolveOptions(options: IjsOptions): ts.ResolvedModuleFull | undefined;
