import { Diagnostic, DiagnosticSeverity, integer, Range, SemanticTokens, SemanticTokensRangeRequest} from 'vscode-languageserver';
import { Line } from './semantic-def';

function get_lines(text:string):Array<Line>{
	const lines:Array<Line> = [];
	const lineStrs =text.split("\n");
	// parsing the text line by line
	for(let i=0;i<lineStrs.length;i++){
		const lineStr = lineStrs[i];
		const line = new Line(lineStr,i);
		lines.push(line);
		}
	return lines;
}

function semantic_analyzer(text:string):Array<Diagnostic>{
	const lines:Array<Line> = get_lines(text);
	let diagnostics:Array<Diagnostic> = [];
	// check errors one by one
	for(let i=0;i<lines.length;i++){
		diagnostics =  diagnostics.concat(lines[i].checkError());
	}
return diagnostics;	
} 

export {get_lines,semantic_analyzer};