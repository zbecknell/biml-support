import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	const bracketDecorationType = vscode.window.createTextEditorDecorationType({
		light: {
			backgroundColor: "rgba(255, 100, 0, .2)"
		},
		dark: {
			backgroundColor: "rgba(0, 100, 255, .2)"
		}
	});

	const codeBlockDecorationType = vscode.window.createTextEditorDecorationType(
		{
			light: {
				backgroundColor: "rgba(100,100,100,0.1)"
			},
			dark: {
				backgroundColor: "rgba(220,220,220,0.1)"
			}
		}
	);

	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(
		editor => {
			activeEditor = editor;
			if (editor) {
				triggerUpdateDecorations();
			}
		},
		null,
		context.subscriptions
	);

	vscode.workspace.onDidChangeTextDocument(
		event => {
			if (activeEditor && event.document === activeEditor.document) {
				triggerUpdateDecorations();
			}
		},
		null,
		context.subscriptions
	);

	var timeout = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 200);
	}

	function updateDecorations() {
		if (!activeEditor || !isCandidateFile(activeEditor)) {
			return;
		}
		const regEx = /(<#@|<#\+|<#=|<#|#>)+/g;
		const text = activeEditor.document.getText();
		const brackets: vscode.DecorationOptions[] = [];
		let match;
		while ((match = regEx.exec(text))) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(
				match.index + match[0].length
			);
			const decoration = {
				range: new vscode.Range(startPos, endPos),
				hoverMessage: ""
			};

			brackets.push(decoration);
		}

		const blocks: vscode.DecorationOptions[] = [];

		let index = 0;
		let max = brackets.length;
		brackets.forEach(element => {
			if (index + 1 < max) {
				const start = brackets[index];
				const end = brackets[index + 1];

				const decoration: vscode.DecorationOptions = {
					range: new vscode.Range(start.range.end, end.range.start),
					hoverMessage: ""
				};

				blocks.push(decoration);
			}

			index += 2;
		});

		activeEditor.setDecorations(bracketDecorationType, brackets);
		activeEditor.setDecorations(codeBlockDecorationType, blocks);
	}

	function isCandidateFile(editor: vscode.TextEditor): boolean {
		return editor.document.languageId === "biml";
	}
}
