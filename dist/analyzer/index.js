"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_1 = require("../parser/ts");
const resolver_1 = require("../resolver");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const chalk_1 = require("chalk");
const debug = require("debug");
const l = debug('analyzer');
const DEFAULTIGNOREFILE = [/.*\.d\.ts/];
const MATHCHEDFILE = [/.*\.tsx$/, /.*\.jsx$/, /.*\.ts$/, /.*\.js$/];
const IGNOREDICTIONARYPATH = [/node_modules/, /\.git/, /\.vscode/, /\.build/];
const tree = {};
const DEFAULTIGNOREDICTIONARY = [/node_modules/];
/*
找出tsconfig文件
*/
function tsConfigFileResolver(options = {
    rootTsConfigPath: '.',
    ignorePaths: [/node_modules/],
}) {
    // 如果是路径带有tsconfig.json，不找了直接返回
    if (options.rootTsConfigPath.indexOf('tsconfig.json') > -1) {
        console.log(chalk_1.default.blue('------------find tsconfig ' + path.resolve(options.rootTsConfigPath)));
        return path.resolve(options.rootTsConfigPath);
    }
    if (!options.ignorePaths) {
        options.ignorePaths = DEFAULTIGNOREDICTIONARY;
    }
    const dirInfos = fs.readdirSync(options.rootTsConfigPath);
    const rootTsConfigPath = options.rootTsConfigPath;
    if (!dirInfos) {
        throw new Error(`readdirSync ${options.rootTsConfigPath} is null`);
    }
    function lazyDictionary(filePath) {
        let isIgnore;
        if (options.ignorePaths) {
            isIgnore = options.ignorePaths.some((reg) => {
                return reg.test(filePath);
            });
        }
        if (!isIgnore) {
            // tslint:disable-next-line:no-shadowed-variable
            const path = tsConfigFileResolver(Object.assign({}, options, { rootTsConfigPath: filePath }));
            if (path) {
                return path;
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    }
    const lazyDictionaries = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < dirInfos.length; i++) {
        const fileName = dirInfos[i];
        const filePath = path.resolve(rootTsConfigPath, fileName);
        // tslint:disable-next-line:no-commented-code
        // l('------------filePath', filePath);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            if (fileName.indexOf('tsconfig.json') > -1) {
                // tsconfig.json 文件
                console.log(chalk_1.default.blue('------------find tsconfig ' + filePath));
                l('------------find tsconfig', filePath);
                return filePath;
            }
        }
        else if (stat.isDirectory()) {
            lazyDictionaries.push(filePath);
        }
    }
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < lazyDictionaries.length; i++) {
        // tslint:disable-next-line:no-shadowed-variable
        const path = lazyDictionary(lazyDictionaries[i]);
        if (path) {
            return path;
        }
    }
    return '';
}
function isValidatePath(str) {
    return !!str;
}
/**
 *
 * @param path 要分析的引用开始路径
 * @param tree 全局引用关系
 * @param saved 用于记录引用次数
 * @param ans 保存循环引用的数组
 */
function analyzeAPathExistCirleRefenrence(
// tslint:disable-next-line:no-shadowed-variable
path, 
// tslint:disable-next-line:no-shadowed-variable
tree, saved = {}, ans = [], level, ansOfTwoArray = [[]]) {
    const denpendences = tree[path] && tree[path].denpendencesFileName;
    if (!denpendences || !denpendences.length) {
        return false;
    }
    saved[path] = saved[path] || { count: 0 };
    let isPushed = false;
    if (level === 0) {
        ans.push(path);
        isPushed = true;
    }
    if (++saved[path].count >= 2) {
        // path 存在循環引用
        saved[path].count--;
        return true;
    }
    for (let i = 0; denpendences && i < denpendences.length; i++) {
        const denpenPath = denpendences[i];
        if (isValidatePath(denpenPath)) {
            // 要考虑中途
            ans.push(denpenPath);
            const anaRes = analyzeAPathExistCirleRefenrence(denpenPath, tree, saved, ans, level + 1, ansOfTwoArray);
            if (anaRes) {
                ansOfTwoArray.push(_.cloneDeep(ans));
            }
            ans.pop();
        }
    }
    saved[path].count--;
    if (isPushed) {
        ans.pop();
    }
    // 每个返回都要减减
    return false;
}
/**
 *
 *
 * 1.分析特定文件的依赖关系 ，先搜索可能的tsconfig.json，根据这个tsconfig.json
 * 调用parse（有些包parse需要tsconfig.json）,解析出文件内对应的依赖,这个依赖都是相对路径
 * 这一步得到import 的那些值
 *
 * 2.之后调用ts api 得到import的绝对路径
 *
 * 3.再保存在树中
 *
 * @param options fileOption
 *   filePath: 文件绝对路径;
 *   tsconfigPath: tsconfig.json 可能路径 会自动搜索;
 */
let tsconfigPath;
async function analyzeFile(options) {
    l('-------analyzeFile options', options);
    const filePath = options.filePath;
    if (!path.isAbsolute(filePath)) {
        throw new Error(`${filePath}不是绝对路径`);
    }
    console.log(chalk_1.default.green(`开始分析 ${filePath}`));
    l(`开始分析 ${filePath}`);
    // 不限制ts
    const denpendences = ts_1.parse(filePath, tsconfigPath, options.isJs);
    l('-----denpendences', denpendences);
    if (options.isJs) {
        const resolvedModules = denpendences.map((notResolvedDenpath) => {
            return resolver_1.jsResolveOptions({
                moduleName: notResolvedDenpath,
                containlingFile: options.filePath,
                alias: options.alias,
            });
        });
        l('-----resolvedModules', resolvedModules);
        tree[filePath] = {
            notResolvedPaths: denpendences,
            resolvedModules,
            denpendencesFileName: resolvedModules.map((item, index) => {
                return item && item.resolvedFileName
                    ? path.resolve(item.resolvedFileName)
                    : denpendences[index];
            }),
        };
    }
    else {
        let tsconfig = {
            compilerOptions: {},
        };
        if (options.tsconfigPath && !tsconfigPath) {
            tsconfigPath = tsConfigFileResolver({
                rootTsConfigPath: options.tsconfigPath,
                ignorePaths: [/node_modules/],
            });
        }
        else if (!tsconfigPath) {
            tsconfigPath = tsConfigFileResolver();
        }
        try {
            tsconfig = JSON.parse(fs.readFileSync(tsconfigPath).toString());
        }
        catch (e) {
            throw new Error('解析tsconfig---error' + e.message);
        }
        const tsdirName = path.dirname(tsconfigPath);
        if (tsconfig &&
            tsconfig.compilerOptions &&
            tsconfig.compilerOptions.baseUrl) {
            // 转换baseUrl
            const baseUrl = path.resolve(tsdirName, tsconfig.compilerOptions.baseUrl);
            tsconfig.compilerOptions.baseUrl = baseUrl;
        }
        const resolvedModules = denpendences.map((notResolvedDenpath) => {
            return resolver_1.tsReolveOptions({
                moduleName: notResolvedDenpath,
                containlingFile: options.filePath,
                optionsTsconfig: tsconfig.compilerOptions,
            });
        });
        tree[filePath] = {
            notResolvedPaths: denpendences,
            resolvedModules,
            denpendencesFileName: resolvedModules.map((item, index) => {
                return item && item.resolvedFileName
                    ? path.resolve(item.resolvedFileName)
                    : denpendences[index];
            }),
        };
    }
    console.log(chalk_1.default.green(`分析完成 ${filePath}`));
    return tree;
}
exports.analyzeFile = analyzeFile;
/**
 * 分析文件夹结构，得到我们的tree结构，传入filePath的话，只分析filePath的的依赖关系，传入
 * dictionaryPath的话，会分析dictionaryPath下所有符合条件文件的依赖关系
 * @param options
 * @return Tree 结构
 */
// tslint:disable-next-line:cognitive-complexity
async function analyze(options) {
    // tslint:disable-next-line:no-commented-code
    // l('------------analyze options', options);
    if (options.filePath) {
        return await analyzeFile({
            filePath: options.filePath,
            tsconfigPath: options.tsconfigPath,
            isJs: options.isJs,
            alias: options.alias,
        });
    }
    if (!options.ignore) {
        options.ignore = options.isJs
            ? DEFAULTIGNOREFILE
            : [/.*\.js$/, ...DEFAULTIGNOREFILE];
    }
    if (!options.match) {
        options.match = MATHCHEDFILE;
    }
    if (!options.ignoreDictionaryPath) {
        options.ignoreDictionaryPath = IGNOREDICTIONARYPATH;
    }
    if (options.dictionaryPath) {
        // tslint:disable-next-line:no-commented-code
        // l('------------analyze options.dictionaryPath', options.dictionaryPath);
        // 分析dictionaryPath中除了ignore之外的所有file
        const dirInfos = fs.readdirSync(options.dictionaryPath);
        if (!dirInfos) {
            throw new Error(`readdirSync ${options.dictionaryPath} is null`);
        }
        // tslint:disable-next-line:no-commented-code
        l('------------analyze dirInfos', dirInfos);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < dirInfos.length; i++) {
            const fileName = dirInfos[i];
            const filePath = path.resolve(options.dictionaryPath, fileName);
            const stat = fs.statSync(filePath);
            const isIgnore = options.ignore.some((em) => {
                return em.test(filePath);
            });
            const isMatch = options.match.some((em) => {
                return em.test(filePath);
            });
            if (stat.isFile() && !isIgnore && isMatch) {
                await analyzeFile({
                    filePath,
                    tsconfigPath: options.tsconfigPath,
                    isJs: options.isJs,
                    alias: options.alias,
                });
            }
            else if (stat.isDirectory()) {
                // tslint:disable-next-line:curly
                if (
                // 如果不是忽略的文件夹
                !options.ignoreDictionaryPath.some((regx) => {
                    return regx.test(filePath);
                })) {
                    l(`分析文件夹 ${filePath}`);
                    // filePath是文件夹路径
                    await analyze({
                        dictionaryPath: filePath,
                        tsconfigPath: options.tsconfigPath,
                        isJs: options.isJs,
                        alias: options.alias,
                    });
                }
                else {
                    console.log(`遇到${options.ignoreDictionaryPath} 忽略`);
                }
            }
        }
    }
    return tree;
}
exports.analyze = analyze;
function findSecondOccur(array) {
    if (array.length === 0) {
        return [];
    }
    // tslint:disable-next-line:no-shadowed-variable
    function findDuplicates(array) {
        // tslint:disable-next-line:no-shadowed-variable
        for (let i = 0; i < array.length; i++) {
            // tslint:disable-next-line:no-shadowed-variable
            for (let j = i + 1; j < array.length; j++) {
                if (array[i] === array[j]) {
                    return [i, j];
                }
            }
        }
        return null;
    }
    const [i, j] = findDuplicates(array) || [0, array.length - 1];
    return array.splice(i, j - i + 1);
}
function isTwoArrayIdentical(array_1, array_2) {
    // clone
    const array1 = Array.from(array_1);
    const array2 = Array.from(array_2);
    return _.difference(array1, array2).length === 0;
}
// tslint:disable-next-line:no-shadowed-variable
function analyzeCirle(tree) {
    const allFilePaths = Object.keys(tree);
    const cirles = [];
    // tslint:disable-next-line:no-shadowed-variable
    allFilePaths.forEach((path) => {
        const ansTwoArray = [[]];
        // ansTwoArray 保存 path的所有循环引用，以二维数组保存
        analyzeAPathExistCirleRefenrence(path, tree, {}, [], 0, ansTwoArray);
        for (const ans of ansTwoArray) {
            let shouldPush = true;
            const cir = findSecondOccur(ans);
            // tslint:disable-next-line:prefer-for-of
            for (let index = 0; index < cirles.length; index++) {
                const cirItem = cirles[index];
                if (isTwoArrayIdentical(cirItem, cir)) {
                    // 过往的有相等的
                    shouldPush = false;
                }
            }
            if (cirles.length === 0) {
                // tslint:disable-next-line:no-unused-expression
                cir && cir.length && cirles.push(cir);
            }
            else if (shouldPush && cir && cir.length) {
                cirles.push(cir);
            }
        }
    });
    return cirles;
}
exports.analyzeCirle = analyzeCirle;
