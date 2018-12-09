import { Tree } from '../analyzer';
/**
 *
 * @param fileName 文件的绝对路径
 * @param gTree analyze 生成的gTree
 */
declare const genDepenceTree: (fileName: string, gTree: Tree) => {
    name: string;
    children: any[];
};
declare const genBeDependentTree: (fileName: string, gTree: Tree) => {
    name: string;
    children: any[];
} | undefined;
export { genDepenceTree, genBeDependentTree };
