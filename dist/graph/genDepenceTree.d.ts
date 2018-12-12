import { Tree } from '../analyzer';
export interface Cricle {
    source: string;
    target: string;
}
/**
 *
 * @param fileName 文件的绝对路径
 * @param gTree analyze 生成的gTree
 */
declare const genDepenceTree: (fileName: string, gTree: Tree) => {
    dependentTree: {
        name: string;
        children: any[];
    };
    circle: Cricle[];
};
declare const genBeDependentTree: (fileName: string, gTree: Tree) => {
    beDependentTree: {
        name: string;
        children: any[];
    };
    circle: Cricle[];
};
export { genDepenceTree, genBeDependentTree };
