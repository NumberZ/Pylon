import { Tree, Option } from '../analyzer';
export interface Node {
    name: string;
    children: Node[];
    size?: string | number;
    totalLineNumber?: string | number;
}
/**
 * 解析特定正则的路径
 * @param tree 保存所有指向的树
 * @param pathRegExpArray 二维数组，存储想要筛选出的路径指向
 */
export declare function calcMatchedPaths(tree: Tree, pathRegExpArray: string[][] | RegExp[][]): Tree;
export interface IuserOpton extends Option {
    genStatFile?: string;
    statFile?: string;
    rules?: string[][] | RegExp[][];
    circle?: boolean;
    lineNumberIgnorePath?: string;
    fileMaxLine?: number;
    tsConfigPath?: string;
    isJs: boolean;
    alias?: {
        [path: string]: string;
    };
    rootFile?: string;
}
export declare function startAnalyze(option: IuserOpton): Promise<void>;
