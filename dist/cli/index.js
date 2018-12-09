#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const version = require('../../package.json').version;
const chalk_1 = require("chalk");
const path = require("path");
const program = require("commander");
const process = require("process");
const fs = require("fs");
const graph_1 = require("../graph");
const cwd = process.cwd();
program
    .version(version)
    .usage('[options] <src...>')
    .option('-p, --path <path>', 'show module dependency in web,the path is the root path of project')
    .option('-g, --gen-stat-file <file>', 'gen stat file')
    .option('-f, --stat-file <file>', 'the stat file to read')
    .option('-r, --rules <rule>', 'the rule to emphasize is an [][] array json')
    .option('-c, --circle', 'whether or not any circleRef', false)
    .option('-l, --line-number-ignore-path <path>', '统计文件行数要忽略的文件路径')
    .option('-m, --file-max-line <max>', '单个文件最大行数')
    .option('-t, --ts-config-path <path>', 'tsconfig路径')
    .option('-j, --is-js', '是否是js项目', false)
    .option('-a, --config <file>', '配置文件')
    .option('-d, --dependences <file>', '生成单个文件的依赖树')
    .parse(process.argv);
let dictionaryPath;
let option;
if (program.path) {
    dictionaryPath = program.path;
}
else {
    dictionaryPath = './';
}
if (program.config) {
    const configFile = path.resolve(cwd, program.config);
    if (!fs.existsSync(configFile))
        throw new Error('请在项目根目录下配置pylon.config.js');
    option = require(configFile);
}
else {
    const rules = program.rules && program.rules.replace(/'/g, '"');
    option = {
        dictionaryPath,
        genStatFile: program.genStatFile,
        statFile: program.statFile,
        rules: rules ? JSON.parse(rules) : '',
        circle: program.circle,
        lineNumberIgnorePath: program.lineNumberIgnorePath,
        fileMaxLine: program.fileMaxLine,
        tsConfigPath: program.tsConfigPath,
        isJs: program.isJs,
        rootFile: program.dependences,
    };
}
console.log(chalk_1.default.bold('option is : '), chalk_1.default.bold(JSON.stringify(option, null, 2)));
try {
    graph_1.startAnalyze(option);
}
catch (e) {
    console.error(e);
}
