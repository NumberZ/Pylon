import { Node } from './graph/';
export declare function isTsRelateve(filename: string): RegExpMatchArray | null;
export interface Inode {
    name: string;
}
export interface Ilink {
    source: number;
    target: number;
}
export declare function getNodesLinksDataWithDictionary(rootPath: string, nodes: Inode[] | undefined, links: Ilink[] | undefined, indexOfParent: number): void;
export declare function getStrLineNumber(str: string): number;
export declare function getTreeDataWithDictionary(rootPath: string, parentNode: Node, ignoreDictionary?: RegExp[]): void;
