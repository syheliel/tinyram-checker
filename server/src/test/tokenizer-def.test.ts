import * as chai from 'chai';
import { TokenInfo, TokenType } from '../tokenizer-def';
const expect = chai.expect;
describe("basic token",() =>{
	it('test for TokenType.Operator',() => {
		expect(new TokenInfo("mov").tokenType).to.be.equal(TokenType.Operator);
		expect(new TokenInfo("add").tokenType).to.be.equal(TokenType.Operator);
		expect(new TokenInfo("answer").tokenType).to.be.equal(TokenType.Operator);

		expect(new TokenInfo("mov22").tokenType).to.be.not.equal(TokenType.Operator);
		expect(new TokenInfo("jmpCC").tokenType).to.be.not.equal(TokenType.Operator);
		expect(new TokenInfo("answer23123").tokenType).to.be.not.equal(TokenType.Operator);
		expect(new TokenInfo("r32").tokenType).to.be.not.equal(TokenType.Operator);
	}
	);

	it('test for TokenType.Register.',() => {
		expect(new TokenInfo("r12").tokenType).to.be.equal(TokenType.Register);
		expect(new TokenInfo("r0").tokenType).to.be.equal(TokenType.Register);

		expect(new TokenInfo("r-1").tokenType).to.be.not.equal(TokenType.Register);
	});
	
	it('test for TokenType.Value.',() => {
		expect(new TokenInfo("122").tokenType).to.be.equal(TokenType.Value);
		expect(new TokenInfo("0").tokenType).to.be.equal(TokenType.Value);

		expect(new TokenInfo("-1").tokenType).to.be.not.equal(TokenType.Value);
		expect(new TokenInfo("22.33").tokenType).to.be.not.equal(TokenType.Value);
	});


});