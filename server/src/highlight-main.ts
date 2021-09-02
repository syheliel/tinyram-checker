import { SemanticTokens,SemanticTokensBuilder } from 'vscode-languageserver';
import { semanticTokensLegend } from './highlight-def';
import { Line } from './semantic-def';
import { get_lines } from './semantic-main';
import { TokenType } from './tokenizer-def';

function LinesToSemanticTokens(lines:Array<Line>) : SemanticTokens{
	
	const builder:SemanticTokensBuilder = new SemanticTokensBuilder();
	for(let i=0;i<lines.length;i++){
		const line = lines[i];
		for(let tokenIdx = 0;tokenIdx < line.tokens.length;tokenIdx++){
			const token = line.tokens[tokenIdx];
			const range = token.range;
			builder.push(range.start.line,
				range.start.character,
				token.tokenStr.length,
				token.info.tokenType,
				0
				);
		}
	}
	const ans = builder.build();
	return ans;
}
export {LinesToSemanticTokens};
