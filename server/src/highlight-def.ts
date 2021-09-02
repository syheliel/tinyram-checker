import { SemanticTokens, SemanticTokensBuilder, SemanticTokensLegend } from 'vscode';
import { SemanticTokenModifiers, SemanticTokenTypes } from 'vscode-languageserver-protocol';

export const semanticTokensLegend:SemanticTokensLegend = {
	tokenTypes:[
		SemanticTokenTypes.operator,
		SemanticTokenTypes.keyword,
		SemanticTokenTypes.number,
		SemanticTokenTypes.comment,
		SemanticTokenTypes.interface
	],
	tokenModifiers:[]
};