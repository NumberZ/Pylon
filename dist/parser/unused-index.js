"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-commented-code
// import { TypescriptParser } from 'typescript-parser';
const _ = require("lodash");
// tslint:disable-next-line:no-var-requires
const precinct = require('precinct');
const fs = require("fs");
// tslint:disable-next-line:no-commented-code
// const parser = new TypescriptParser();
async function getTsdenpenDences(pathOrSource) {
    // 所有的都已es6来
    const content = fs.readFileSync(pathOrSource).toString();
    let res = await precinct(content, {
        type: 'es6',
        es6: { mixedImports: true },
    });
    res = _.uniq(res);
    return res;
}
exports.getTsdenpenDences = getTsdenpenDences;
