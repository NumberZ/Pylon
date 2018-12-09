"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const analyzer_1 = require("../analyzer");
const opener = require("opener");
const express = require("express");
const chalk_1 = require("chalk");
const fs = require("fs");
const _ = require("lodash");
const util_1 = require("../util");
const genDepenceTree_1 = require("./genDepenceTree");
function findAllWithPredictInArray(arr, predict) {
    if (!Array.isArray(arr)) {
        return [];
    }
    const res = [];
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (predict(element)) {
            res.push(element);
        }
    }
    return res;
}
/**
 * 解析特定正则的路径
 * @param tree 保存所有指向的树
 * @param pathRegExpArray 二维数组，存储想要筛选出的路径指向
 */
// tslint:disable-next-line:cognitive-complexity
function calcMatchedPaths(tree, pathRegExpArray) {
    const treeWithRule = {};
    const allSourceFiles = Object.keys(tree);
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < pathRegExpArray.length; index++) {
        const pathRegExp = pathRegExpArray[index];
        let sourceRegExp = pathRegExp[0];
        let targetRegExp = pathRegExp[1];
        if (typeof sourceRegExp === 'string') {
            sourceRegExp = new RegExp(sourceRegExp);
        }
        if (typeof targetRegExp === 'string') {
            targetRegExp = new RegExp(targetRegExp);
        }
        const allMatchedSourceFile = findAllWithPredictInArray(allSourceFiles, (souceFileName) => {
            return sourceRegExp.test(souceFileName);
        });
        // tslint:disable-next-line:prefer-for-of
        for (let indexF = 0; indexF < allMatchedSourceFile.length; indexF++) {
            const matchedSourceFile = allMatchedSourceFile[indexF];
            const targetFilesNamesWithMatchedSourceFile = tree[matchedSourceFile].denpendencesFileName;
            const targetMatchedFilesNamesWithMatchedSourceFiles = findAllWithPredictInArray(targetFilesNamesWithMatchedSourceFile, (targetFileName) => {
                return targetRegExp.test(targetFileName);
            });
            if (targetMatchedFilesNamesWithMatchedSourceFiles &&
                targetMatchedFilesNamesWithMatchedSourceFiles.length) {
                if (treeWithRule[matchedSourceFile] &&
                    treeWithRule[matchedSourceFile].denpendencesFileName) {
                    // 如果已经有了指向的依赖
                    const temp = treeWithRule[matchedSourceFile].denpendencesFileName;
                    treeWithRule[matchedSourceFile].denpendencesFileName = temp.concat(targetMatchedFilesNamesWithMatchedSourceFiles);
                    _.uniq(treeWithRule[matchedSourceFile].denpendencesFileName);
                }
                else {
                    treeWithRule[matchedSourceFile] = {
                        denpendencesFileName: targetMatchedFilesNamesWithMatchedSourceFiles,
                    };
                }
            }
        }
    }
    return treeWithRule;
}
exports.calcMatchedPaths = calcMatchedPaths;
async function startAnalyze(option) {
    const saved = {};
    if (!path.isAbsolute(option.dictionaryPath)) {
        option.dictionaryPath = path.resolve(option.dictionaryPath);
    }
    let tree;
    if (option.statFile) {
        tree = JSON.parse(fs.readFileSync(option.statFile).toString());
    }
    else {
        try {
            tree = await analyzer_1.analyze(Object.assign(option, { tsconfigPath: option.tsConfigPath }));
            fs.writeFileSync(path.join(process.cwd(), 'pylon.json'), JSON.stringify(tree));
        }
        catch (e) {
            console.error(e);
        }
    }
    if (option.rootFile) {
        fs.writeFileSync(path.join(process.cwd(), 'dependences.json'), JSON.stringify(genDepenceTree_1.genBeDependentTree(option.rootFile, tree)));
    }
    try {
        console.log(chalk_1.default.bold('---------开始生成项目结构'));
        util_1.getTreeDataWithDictionary(option.dictionaryPath, saved);
    }
    catch (e) {
        console.error(e);
    }
    if (option.genStatFile) {
        fs.writeFileSync(option.genStatFile, JSON.stringify(tree));
    }
    let treeWithRule;
    if (option.rules) {
        // 不管tree是哪里得到的
        try {
            treeWithRule = calcMatchedPaths(tree, option.rules);
        }
        catch (e) {
            console.error(e);
            treeWithRule = {};
        }
        const keysWithRules = Object.keys(treeWithRule);
        console.log(chalk_1.default.bold(`分析关系 ${option.rules} \r\n`));
        for (const key of keysWithRules) {
            console.log(chalk_1.default.blueBright(`${JSON.stringify(key)}
------- 依赖 --------->
${JSON.stringify(treeWithRule[key].denpendencesFileName) + '\r\n'}
`));
        }
    }
    let circle;
    if (option.circle) {
        circle = analyzer_1.analyzeCirle(tree);
        console.log(chalk_1.default.bold('循环引用路径二维数组存储： \n\r'));
        for (const circleItem of circle) {
            console.log(chalk_1.default.redBright(`循环引用 --------->
${JSON.stringify(circleItem) + '\r\n'}
`));
        }
    }
    startServer(tree, saved.children[0], treeWithRule, path.resolve(option.dictionaryPath, '..'), circle, option.rules, option.lineNumberIgnorePath, option.fileMaxLine);
}
exports.startAnalyze = startAnalyze;
function startServer(denpendencyData, fileArch, treeWithRule, prefix, circles, rules, lineNumberIgnorePath, fileMaxLine) {
    const { port = 8887, host = '127.0.0.1', openBrowser = true } = {};
    const projectRoot = path.resolve(__dirname, '../..');
    const app = express();
    app.engine('ejs', require('ejs').renderFile);
    app.set('view engine', 'ejs');
    app.set('views', `${projectRoot}/src/template`);
    app.use(express.static(`${projectRoot}/src/static`));
    app.use('/getFileContent', (req, res) => {
        if (req.query.filePath) {
            const fileContent = fs.readFileSync(req.query.filePath).toString();
            res.send({ content: fileContent });
        }
        else {
            res.send({ content: '' });
        }
    });
    app.use('/', (_req, res) => {
        res.set('Content-Type', 'text/html');
        res.render('denpendencyWithD3', {
            get denpencyData() {
                return JSON.stringify(denpendencyData);
            },
            get fileArch() {
                return JSON.stringify(fileArch);
            },
            get treeWithRule() {
                if (!treeWithRule) {
                    return '';
                }
                return JSON.stringify(treeWithRule);
            },
            get pathPrefix() {
                return prefix || '';
            },
            get circles() {
                return JSON.stringify(circles || '');
            },
            get rules() {
                return JSON.stringify(rules || '');
            },
            get lineNumerIgnorePath() {
                return lineNumberIgnorePath || '';
            },
            get fileMaxLine() {
                if (!fileMaxLine) {
                    return '';
                }
                return +fileMaxLine || '';
            },
        });
    });
    app.listen(port, () => {
        const url = `http://${host}:${port}`;
        console.log('listen:', host, port);
        if (openBrowser) {
            opener(url);
        }
    });
}
