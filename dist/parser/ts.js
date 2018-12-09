"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const _ = require("lodash");
const ts_simple_ast_1 = require("ts-simple-ast");
const debug = require("debug");
const l = debug('parse');
function getTsdenpenDences(options, res = [], isJs) {
    const project = new ts_simple_ast_1.default(options.tsConfigFilePath
        ? {
            tsConfigFilePath: options.tsConfigFilePath,
        }
        : {});
    let sourceFile;
    if (isJs) {
        // sholdnot call save
        sourceFile = project.addExistingSourceFile(options.filePath);
    }
    else {
        sourceFile = project.addExistingSourceFile(options.filePath); // or addExistingSourceFileIfExists
    }
    // get them all
    const imports = sourceFile.getImportDeclarations();
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < imports.length; i++) {
        const importDeclaration = imports[i];
        const denpen = importDeclaration.getModuleSpecifierValue();
        res.push(denpen);
    }
    return res;
}
exports.getTsdenpenDences = getTsdenpenDences;
function walk(sourceFile) {
    const denpendences = [];
    _walk(sourceFile);
    function _walk(node) {
        if (node.kind === ts_simple_ast_1.SyntaxKind.ImportDeclaration) {
            l(`node.kind === SyntaxKind.ImportDeclaration`);
            return;
        }
        if (node.kind === ts_simple_ast_1.SyntaxKind.CallExpression) {
            // 非贪婪
            const matched = node.getText().match(/(import|require)\((.+?)\)/);
            // tslint:disable-next-line:no-unused-expression
            matched && denpendences.push(matched[2].replace(/'|"/g, ''));
        }
        ts_simple_ast_1.ts.forEachChild(node, _walk);
    }
    return denpendences;
}
exports.walk = walk;
function parse(fileName, tsConfigFilePath, isJs) {
    // Parse a file ts js都可以
    l('--------analyzeFile', fileName, tsConfigFilePath, isJs);
    const sourceFile = ts_simple_ast_1.ts.createSourceFile(fileName, fs_1.readFileSync(fileName).toString(), ts_simple_ast_1.ScriptTarget.ESNext, 
    /*setParentNodes */ true);
    // walk it
    const denpendencesWithoutWalker = getTsdenpenDences({
        filePath: fileName,
        tsConfigFilePath,
    }, [], isJs);
    let denpendences = walk(sourceFile);
    denpendences = denpendencesWithoutWalker.concat(denpendences);
    return _.uniq(denpendences);
}
exports.parse = parse;
