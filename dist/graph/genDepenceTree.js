"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as fs from 'fs';
// const getSize = (path: string) => {
//   if (path.match(/\.(j|t)sx?$/gi)) {
//     const stat = fs.statSync(path);
//     return (stat.size / 1024).toFixed(2);
//   }
//   return;
// };
/**
 *
 * @param fileName 文件的绝对路径
 * @param gTree analyze 生成的gTree
 */
const genDepenceTree = (fileName, gTree) => {
    const genDependences = (name) => {
        return gTree[name] ? gTree[name].denpendencesFileName : undefined;
    };
    const genChildren = (name) => {
        const dependences = genDependences(name);
        const result = [];
        if (!dependences || dependences.length === 0)
            return [];
        for (let i = 0; i < dependences.length; i++) {
            const name = dependences[i];
            result.push({
                name,
                children: genChildren(name),
            });
        }
        return result;
    };
    return {
        name: fileName,
        children: genChildren(fileName),
    };
};
exports.genDepenceTree = genDepenceTree;
const genBeDependentTree = (fileName, gTree) => {
    const keys = Object.keys(gTree);
    if (keys.indexOf(fileName) === -1)
        return;
    const genChildren = (name) => {
        if (!gTree[name])
            return [];
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const leaf = gTree[key];
            if (leaf.denpendencesFileName.indexOf(name) !== -1) {
                console.log(key);
                result.push({
                    name: key,
                    children: genChildren(key),
                });
            }
        }
        return result;
    };
    return {
        name: fileName,
        children: genChildren(fileName),
    };
};
exports.genBeDependentTree = genBeDependentTree;
