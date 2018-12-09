import * as ts from 'typescript';
export interface Option {
    filePath?: string;
    dictionaryPath: string;
    ignoreDictionaryPath?: RegExp[];
    ignore?: RegExp[];
    match?: RegExp[];
    tsconfigPath?: string;
    alias?: {
        [path: string]: string;
    };
    isJs: boolean;
}
export declare type tsResolveMod = ts.ResolvedModuleFull | undefined;
export interface ItreeItem {
    notResolvedPaths?: string[];
    resolvedModules?: tsResolveMod[];
    denpendencesFileName: string[];
}
export interface IfileOption {
    filePath: string;
    tsconfigPath?: string;
    isJs: boolean;
    alias?: {
        [path: string]: string;
    };
}
export interface Tree {
    [path: string]: ItreeItem;
}
export declare function analyzeFile(options: IfileOption): Promise<Tree>;
/**
 * 分析文件夹结构，得到我们的tree结构，传入filePath的话，只分析filePath的的依赖关系，传入
 * dictionaryPath的话，会分析dictionaryPath下所有符合条件文件的依赖关系
 * @param options
 * @return Tree 结构
 */
export declare function analyze(options: Option): Promise<Tree>;
export declare function analyzeCirle(tree: Tree): string[][];
