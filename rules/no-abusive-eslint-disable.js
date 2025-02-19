const MESSAGE_ID = 'no-abusive-eslint-disable';
const messages = {
	[MESSAGE_ID]: 'Specify the rules you want to disable.',
};

const disableRegex = /^eslint-disable(?:-next-line|-line)?(?<ruleId>$|(?:\s+(?:@(?:[\w-]+\/){1,2})?[\w-]+)?)/;

/** @param {import('eslint').Rule.RuleContext} context */
const create = context => ({
	* Program(node) {
		for (const comment of node.comments) {
			const value = comment.value.trim();
			const result = disableRegex.exec(value);

			if (
				result // It's a eslint-disable comment
				&& !result.groups.ruleId // But it did not specify any rules
			) {
				const {sourceCode} = context;

				yield {
					// Can't set it at the given location as the warning
					// will be ignored due to the disable comment
					loc: {
						start: {
							...sourceCode.getLoc(comment).start,
							column: -1,
						},
						end: sourceCode.getLoc(comment).end,
					},
					messageId: MESSAGE_ID,
				};
			}
		}
	},
});

/** @type {import('eslint').Rule.RuleModule} */
const config = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Enforce specifying rules to disable in `eslint-disable` comments.',
			recommended: true,
		},
		messages,
	},
};

export default config;
