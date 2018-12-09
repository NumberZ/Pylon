"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const chalk_1 = require("chalk");
function isTsRelateve(filename) {
    return filename.match(/\.(j|t)sx?$/gi);
}
exports.isTsRelateve = isTsRelateve;
// 根据文件路径获得nodes，links结构数据
function getNodesLinksDataWithDictionary(rootPath, nodes = [], links = [], indexOfParent) {
    const stat = fs.statSync(rootPath);
    if (!stat.isDirectory() && !isTsRelateve(rootPath)) {
        // 是文件 不是ts相关文件
        return;
    }
    const indexOfChildren = nodes.push({ name: rootPath }) - 1;
    if (indexOfChildren !== 0) {
        links.push({
            source: indexOfParent,
            target: indexOfChildren,
        });
    }
    if (!stat.isDirectory()) {
        // 是文件
        return;
    }
    const dirInfos = fs.readdirSync(rootPath);
    for (let index = 0; dirInfos && index < dirInfos.length; index++) {
        const subPath = dirInfos[index];
        const filePath = path.resolve(rootPath, subPath);
        getNodesLinksDataWithDictionary(filePath, nodes, links, indexOfChildren);
    }
}
exports.getNodesLinksDataWithDictionary = getNodesLinksDataWithDictionary;
/*获得一段文本的行数*/
function getStrLineNumber(str) {
    const match = str.match(/(.*)[\n|\r]/g);
    if (!match) {
        return 0;
    }
    return match.length;
}
exports.getStrLineNumber = getStrLineNumber;
// 把文件结构转化为树状结构
function getTreeDataWithDictionary(rootPath, parentNode, ignoreDictionary = [/node_modules/, /\.git/, /\.vscode/]) {
    const stat = fs.statSync(rootPath);
    if (!stat.isDirectory() && !isTsRelateve(rootPath)) {
        // 是文件 不是ts相关文件
        return;
    }
    const node = {};
    node.name = rootPath;
    console.log('rootPath', rootPath);
    parentNode.children = parentNode.children || [];
    parentNode.children.push(node);
    if (!stat.isDirectory()) {
        // 如果是文件
        node.totalLineNumber = getStrLineNumber(fs.readFileSync(rootPath).toString());
        if (node.totalLineNumber === 0) {
            console.log(chalk_1.default.bgRedBright(`${rootPath} is empty!!!!`));
        }
        node.size = (stat.size / 1024).toFixed(2) + 'kb';
        return;
    }
    else if (ignoreDictionary.some((dictionaryReg) => {
        return dictionaryReg.test(rootPath);
    })) {
        // 如果是要忽略掉的文件夹
        return;
    }
    const dirInfos = fs.readdirSync(rootPath);
    for (let index = 0; dirInfos && index < dirInfos.length; index++) {
        const subPath = dirInfos[index];
        node.children = node.children || [];
        const filePath = path.resolve(rootPath, subPath);
        getTreeDataWithDictionary(filePath, node, ignoreDictionary);
    }
}
exports.getTreeDataWithDictionary = getTreeDataWithDictionary;