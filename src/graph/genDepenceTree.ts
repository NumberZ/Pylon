import { Tree } from '../analyzer';
export interface Cricle {
  source: string;
  target: string;
}
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
const genDepenceTree = (fileName: string, gTree: Tree) => {
  const genDependences = (name: string) => {
    return gTree[name] ? gTree[name].denpendencesFileName : undefined;
  };
  const stack: string[] = [];
  const circle: Cricle[] = [];
  const genChildren = (name: string): any[] => {
    stack.push(name);
    const dependences = genDependences(name);
    const result = [];
    if (!dependences || dependences.length === 0) return [];
    for (let i = 0; i < dependences.length; i++) {
      const child = dependences[i];
      if (stack.indexOf(child) !== -1) {
        circle.push({
          source: name,
          target: child,
        });
      } else {
        result.push({
          name: child,
          children: genChildren(child),
        });
      }
      stack.pop();
    }
    return result;
  };

  const dependentTree = {
    name: fileName,
    children: genChildren(fileName),
  };
  return {
    dependentTree,
    circle,
  };
};

// function checkCircle(path: string, tree: Tree) {
//   const ansTwoArray = [[]];
//   analyzeAPathExistCirleRefenrence(path, tree, {}, [], 0, ansTwoArray);
//   return ansTwoArray;
// }

const genBeDependentTree = (fileName: string, gTree: Tree) => {
  const keys = Object.keys(gTree);
  const stack: string[] = [];
  const circle: Cricle[] = [];

  if (keys.indexOf(fileName) === -1)
    return {
      beDependentTree: {
        name: fileName,
        children: [],
      },
      circle,
    };
  const genChildren = (name: string): any[] => {
    if (!gTree[name]) return [];
    stack.push(name);
    const result = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const leaf = gTree[key];
      if (leaf.denpendencesFileName.indexOf(name) !== -1) {
        if (stack.indexOf(key) !== -1) {
          circle.push({
            source: name,
            target: key,
          });
        } else {
          result.push({
            name: key,
            children: genChildren(key),
          });
          stack.pop();
        }
      }
    }
    return result;
  };

  const beDependentTree = {
    name: fileName,
    children: genChildren(fileName),
  };
  return {
    beDependentTree,
    circle,
  };
};

export { genDepenceTree, genBeDependentTree };
