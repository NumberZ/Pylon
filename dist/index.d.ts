import { IuserOpton } from './graph';
import { Tree, analyzeFile } from './analyzer';
import { genBeDependentTree, genDepenceTree } from './graph/genDepenceTree';
declare class Pylon {
    private option;
    constructor(option: IuserOpton);
    startAnalyze(): void;
    genGTree(): Promise<Tree>;
}
export { genDepenceTree, genBeDependentTree, analyzeFile, IuserOpton };
export default Pylon;
