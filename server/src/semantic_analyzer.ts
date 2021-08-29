import { Diagnostic, DiagnosticSeverity, integer, Range} from 'vscode-languageserver';
import {TokenInfo, TokenType} from './typedef';
import {window} from 'vscode';
class Line{
	lineStr:string;
	lineNo:integer;
	tokens:Array<Token>;

	// divide line into tokens
	constructor(literal:string,lineNo:integer){
		this.lineStr = literal;
		this.lineNo = lineNo;
		this.tokens = [];

		// first get comment
		const commentPattern = /;[\x00-\x7F]*/g;
		let commentToken:Token | null;
		commentToken = null;
		let m: RegExpExecArray | null;
		if((m = commentPattern.exec(literal))){
			literal = literal.slice(0,m.index);
			commentToken = new Token(m[0],lineNo,m.index);
		}

		// then get all tokens
		const tokenPattern = /\b[^\s]+\b/g;
		while((m = tokenPattern.exec(literal))){
			this.tokens.push(new Token(m[0],lineNo,m.index));
		}

		//finally push comment if it exists
		if(commentToken !=null){
			this.tokens.push(commentToken);
		}
	}

	//check error in one line
	checkError():Array<Diagnostic>{
		const diagnostics:Array<Diagnostic> = [];

		if(this.tokens.length == 0)return diagnostics;

		// first check all token's correctness
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

		// then use first token check following tokens number and type
		const firstToken = this.tokens[0];
		// first token must be operator or comment
		if(firstToken.info.tokenType != TokenType.Operator && firstToken.info.tokenType != TokenType.Comment){
			const diagnostic: Diagnostic ={
				severity:DiagnosticSeverity.Error,
				message:`first token must be operator or comment`,
				range:firstToken.range
			};
			diagnostics.push(diagnostic);
		}

		const followingTokenTypes = firstToken.info.followingTokenTypes;
		for(let i=1;i<this.tokens.length;i++){
			const token = this.tokens[i];
			console.log(i);
			// check length
			if(i - 1 >= followingTokenTypes.length && token.info.tokenType != TokenType.Comment){
				const diagnostic: Diagnostic ={
					severity:DiagnosticSeverity.Error,
					message:`too much parameters for type(${TokenType[firstToken.info.tokenType]})`,
					range:token.range
				};
				diagnostics.push(diagnostic);
				continue;
			}

			// check type
			if(token.info.tokenType != followingTokenTypes[i-1]){
				const diagnostic: Diagnostic ={
					severity:DiagnosticSeverity.Error,
					message:`current type(${TokenType[token.info.tokenType]}) should be (${TokenType[followingTokenTypes[i-1]]})`,
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