"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const graph_1 = require("./graph");
const analyzer_1 = require("./analyzer");
exports.analyzeFile = analyzer_1.analyzeFile;
const genDepenceTree_1 = require("./graph/genDepenceTree");
exports.genBeDependentTree = genDepenceTree_1.genBeDependentTree;
exports.genDepenceTree = genDepenceTree_1.genDepenceTree;
class Pylon {
    constructor(option) {
        this.option = option;
    }
    startAnalyze() {
        graph_1.startAnalyze(this.option);
    }
    async genGTree() {
        const { option } = this;
        let tree;
        if (option.statFile) {
            tree = JSON.parse(fs.readFileSync(option.statFile).toString());
        }
        else {
            tree = await analyzer_1.analyze(Object.assign(this.option, { tsconfigPath: this.option.tsConfigPath }));
        }
        return tree;
    }
}
exports.default = Pylon;
