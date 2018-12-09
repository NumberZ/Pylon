import { ts } from 'ts-simple-ast';
export interface Ioption {
    tsConfigFilePath: string;
    filePath: string;
}
export declare function getTsdenpenDences(options: Ioption, res?: string[], isJs?: boolean): string[];
export declare function walk(sourceFile: ts.SourceFile): string[];
export declare function parse(fileName: string, tsConfigFilePath: string, isJs: boolean): string[];
