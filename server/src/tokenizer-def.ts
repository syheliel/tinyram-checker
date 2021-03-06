import { integer, Range } from 'vscode-languageserver';

class Token{
	// original string
	tokenStr:string;
	// range used for Diagnostic 
	range:Range;
	//token's information about its token type and its operands types
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


// basic token type
enum TokenType {
	Operator,
	Register,
	Value,
	Comment,
	Unknown
}

// regex for different token
const ValuePattern = /^\d+$/;
const RegisterPattern = /^r\d+$/;
const commentPattern = /;[\x20-\x7F|\r]*$/;
const versionStr = "\\d*\\.\\d*";
const integerStr = "\\d*";
// first line of the comment containing parameters
const firstCommentPattern = RegExp(`;\\s+TinyRAM\\s+V=(${versionStr})\\s+W=(${integerStr})\\s+K=(${integerStr})`);

// Operator are divided into 5 classes according to its function(also good for calculating operands' number)
const OperatorArithmeticPattern = RegExp("^(and|or|xor|not|add|sub|mull|umulh|smulh|udiv|umod|shl|shr)$", "i");
const OperatorComparePattern = RegExp("^(cmpe|cmpa|cmpae|cmpg|cmpge)$", "i");
const OperatorMovePattern = RegExp("^(mov|cmov)$", "i");
const OperatorJumpPattern = RegExp("^(jmp|cjmp|cnjmp)$", "i");
const OperatorSpecialPattern = RegExp("^(store|load|read|answer)$", "i");

// default compile info
const compileInfo = {
	version: "default version",
	// word size
	W: 16,
	// register number
	K: 16,
};


class TokenInfo {
	tokenType: TokenType;
	followingTokenTypes: Array<TokenType>;
	// this method is created to simplify the judgement for operator
	private static isOperator(literal: string) {
		return OperatorArithmeticPattern.exec(literal)
			|| OperatorComparePattern.exec(literal)
			|| OperatorMovePattern.exec(literal)
			|| OperatorJumpPattern.exec(literal)
			|| OperatorSpecialPattern.exec(literal);
	}

	// get token type according to its literal string
	private static getFollowingTokenTypes(literal: string): TokenType {
		if (RegisterPattern.exec(literal)) return TokenType.Register;
		if (ValuePattern.exec(literal)) return TokenType.Value;
		if (commentPattern.exec(literal)) return TokenType.Comment;
		if (this.isOperator(literal)) return TokenType.Operator;
		return TokenType.Unknown;
	}

	// get next operands type
	private static getNextOperandsType(literal: string): Array<TokenType> {
		// first convert it into lowercase
		literal = literal.toLowerCase();
		// three Operands [reg,reg,val]
		const triple = [TokenType.Register, TokenType.Register, TokenType.Value];
		// two Operands
		const tuple = [TokenType.Register, TokenType.Value]; // [reg,val]
		const tuple_rev = [TokenType.Value, TokenType.Register]; // [val,reg]
		// one Operands are omitted

		// only operator has following operands
		if (TokenInfo.getFollowingTokenTypes(literal) != TokenType.Operator)
			return [];

		if (OperatorArithmeticPattern.exec(literal)) {
			if (literal == 'not') return tuple; // exception for arithmetic operator
			return triple;
		}
		else if (OperatorComparePattern.exec(literal) || OperatorMovePattern.exec(literal)) {
			return tuple;
		}
		else if (OperatorJumpPattern.exec(literal)) {
			return [TokenType.Value]; // one operands
		}
		else if (OperatorSpecialPattern.exec(literal)) {
			if (literal == 'store') {
				return tuple_rev;
			}
			else if (literal == 'load' || literal == 'read') {
				return tuple;
			} else if (literal == 'answer') {
				return [TokenType.Value];
			}
		}

		return [];
	}
	constructor(literal: string) {
		this.tokenType = TokenInfo.getFollowingTokenTypes(literal);
		this.followingTokenTypes = TokenInfo.getNextOperandsType(literal);
	}
}

export { TokenInfo, TokenType,Token,commentPattern, firstCommentPattern, compileInfo };