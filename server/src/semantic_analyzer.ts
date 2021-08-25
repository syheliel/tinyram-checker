import { Diagnostic, DiagnosticSeverity, integer, Range } from 'vscode-languageserver';
import {TokenInfo, TokenType} from './typedef';
class Line{
	lineStr:string;
	lineNo:integer;
	tokens:Array<Token>;
	constructor(literal:string,lineNo:integer){
		this.lineStr = literal;
		this.lineNo = lineNo;
		this.tokens = [];
		const tokenPattern = /\b[^\s]+\b/g;
		let m: RegExpExecArray | null;
		while((m = tokenPattern.exec(literal))){
			this.tokens.push(new Token(m[0],lineNo,m.index));
		}
	}

	checkError():Array<Diagnostic>{
		const diagnostics:Array<Diagnostic> = [];
		if(this.tokens.length == 0)return diagnostics;
		for(let i = 0;i<this.tokens.length;i++){
			const token = this.tokens[i];
			if(token.info.tokenType == TokenType.Unknown){
				const diagnostic: Diagnostic ={
					severity:DiagnosticSeverity.Error,
					message:"unknown token",
					range:token.range
				};
				diagnostics.push(diagnostic);
			}
		}
		return diagnostics;
	}
}

class Token{
	tokenStr:string;
	range:Range;
	public info:TokenInfo;
	constructor(literal:string,lineNo:integer,offset:integer){
		this.tokenStr = literal;
		this.range = {
			start:{line:lineNo,character:offset},
			end:{line:lineNo,character:offset+literal.length}
		};
		this.info = new TokenInfo(literal);
	}
}
function semantic_analyzer(text:string):Array<Diagnostic>{
	const lines:Array<Line> = [];
	let diagnostics:Array<Diagnostic> = [];
	const lineStrs =text.split("\n");
	for(let i=0;i<lineStrs.length;i++){
		const lineStr = lineStrs[i];
		const line = new Line(lineStr,i);
		lines.push(line);
		diagnostics =  diagnostics.concat(line.checkError());
	}
return diagnostics;	
} 

export default semantic_analyzer;