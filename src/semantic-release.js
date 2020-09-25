const { to } = require("await-to-js");

// Determine release type, change log, etc..
const generateContext = async (contextPlugins) => {
	const context = {};

	for (let plugin of contextPlugins) {
		await plugin(context);
	}

	return context;
};

const semanticRelease = async (config) => {
	const context = Object.freeze(await generateContext(config.context));
	const commands = config.commands;

	for (let i = 0, l = commands.length; i < l; i += 1) {
		const command = commands[i];
		const [error] = await to(command.execute(context));

		if (error) {
			while (i--) {
				[undoError] = await to(commands[i].undo(context));
			}

			break;
		}
	}
};

module.exports = { semanticRelease }