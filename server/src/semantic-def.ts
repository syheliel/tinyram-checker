

import { Diagnostic, DiagnosticSeverity, integer, Range, SemanticTokens, SemanticTokensRangeRequest} from 'vscode-languageserver';
import {firstCommentPattern, TokenInfo, TokenType,compileInfo, Token, commentPattern} from './tokenizer-def';
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
		let commentToken:Token | null;
		commentToken = null;
		let m: RegExpExecArray | null;
		const commentPattern = /;[\x20-\x7F|\r]*$/g;
		if((m = commentPattern.exec(literal))){
			literal = literal.slice(0,m.index);
			commentToken = new Token(m[0],lineNo,m.index);
		}

		// then get all tokens
		const tokenPattern = /\b[^\s]+\b/g;
		while((m = tokenPattern.exec(literal))){
			this.tokens.push(new Token(m[0],lineNo,m.index));
		}

		//finally add comment if it exists
		if(commentToken !=null){
			this.tokens.push(commentToken);
		}
	}

	//check error for one single line
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
			else if(token.info.tokenType == TokenType.Register){
				const tokenStr = token.tokenStr;
				const registerNo = parseInt(tokenStr.slice(1,tokenStr.length));
				if(registerNo >= compileInfo.K){
					const diagnostic: Diagnostic ={
						severity:DiagnosticSeverity.Error,
						message:`register number(${registerNo}) is larger then K(${compileInfo.K})`,
						range:token.range
					};
					diagnostics.push(diagnostic);
				}
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
		// check if the first line is comment
		let m ;
		if(this.lineNo == 0){
			if((m = firstCommentPattern.exec(firstToken.tokenStr))){
				compileInfo.version = m[1];
				compileInfo.W = parseInt(m[2]);
				compileInfo.K = parseInt(m[3]);
			}else{
				const diagnostic: Diagnostic ={
					severity:DiagnosticSeverity.Error,
					message:`first line should like '; TinyRAM V=1.00 W=W K=K'`,
					range:firstToken.range
				};
				diagnostics.push(diagnostic);
			}
		}
		

		const followingTokenTypes = firstToken.info.followingTokenTypes;
		for(let i=1;i<this.tokens.length;i++){
			const token = this.tokens[i];
			// check operands type
			if(i - 1 < followingTokenTypes.length)
			{
				const correctTokenType = followingTokenTypes[i-1];
				// check type
				if(token.info.tokenType != correctTokenType){
					const diagnostic: Diagnostic ={
						severity:DiagnosticSeverity.Error,
						message:`current type(${TokenType[token.info.tokenType]}) should be (${TokenType[followingTokenTypes[i-1]]})`,
						range:token.range
					};
					diagnostics.push(diagnostic);
				}
			}
			else
			{ // check tokens after all operands
			if(token.info.tokenType != TokenType.Comment){
				const diagnostic: Diagnostic ={
					severity:DiagnosticSeverity.Error,
					message:`too much parameters for type(${TokenType[firstToken.info.tokenType]})`,
					range:token.range
				};
				diagnostics.push(diagnostic);
				}
			}

		}
		return diagnostics;
	}
}
export {Line};