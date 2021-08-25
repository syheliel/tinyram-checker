import { integer } from 'vscode-languageserver';

enum TokenType{
	Operator,
	Register,
	Value,
	Unknown
}
const ValuePattern = /^\d+$/;
const RegisterPattern = /^r\d+$/;

// OPerator are divided into 5 classes to simplify operands check
const OperatorArithmeticPattern = RegExp("(and|or|xor|not|add|sub|mull|umulh|smulh|udiv|umod|shl|shr)","i");
const OperatorComparePattern = RegExp("(cmpe|cmpa|cmpae|cmpg|cmpge)","i");
const OperatorMovePattern = RegExp("(mov|cmov)","i");
const OperatorJumpPattern = RegExp("(jmp|cjmp|cnjmp)","i");
const OperatorSpecialPattern = RegExp("(store|load|read|answer)","i");

class TokenInfo{
	tokenType:TokenType;
	operandType:Array<TokenType>;
	private static isOperator(literal:string){
		return OperatorArithmeticPattern.exec(literal)
		|| OperatorComparePattern.exec(literal)
		|| OperatorMovePattern.exec(literal)
		|| OperatorJumpPattern.exec(literal)
		|| OperatorSpecialPattern.exec(literal);
	}
	private static getTokenType(literal:string):TokenType{
		if(RegisterPattern.exec(literal)) return TokenType.Register;
		if(ValuePattern.exec(literal)) return TokenType.Value;
		if(this.isOperator(literal)) return TokenType.Operator;
		return TokenType.Unknown;
	}
	
	private static getOperandType(literal:string):Array<TokenType>{
		literal = literal.toLowerCase();
		// three Operands
		const triple = [TokenType.Register,TokenType.Register,TokenType.Value];
		// two Operands
		const tuple = [TokenType.Register,TokenType.Value];
		const tuple_rev = [TokenType.Value,TokenType.Register];

		if(TokenInfo.getTokenType(literal) != TokenType.Operator)
			return [];
		if(OperatorArithmeticPattern.exec(literal)){
			if(literal == 'not')return tuple;
			return triple;
		}
		else if(OperatorComparePattern.exec(literal) || OperatorMovePattern.exec(literal)){
			return tuple;
		}
		else if(OperatorJumpPattern.exec(literal)){
			return [TokenType.Value];
		}
		else if(OperatorSpecialPattern.exec(literal)){
			if(literal == 'store'){
				return tuple_rev;
			}
			if(literal == 'answer'){
				return [TokenType.Value]; 
			}
		}
		return [];
	}
	constructor(literal:string){
		this.tokenType = TokenInfo.getTokenType(literal);
		this.operandType = TokenInfo.getOperandType(literal);
	}
}
export {TokenInfo,TokenType};