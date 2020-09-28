const { to } = require("await-to-js");

const generateContext = async (contextPlugins) => {
	const context = {};

	for (const plugin of contextPlugins) {
		await Promise.resolve(plugin(context));
	}

	return context;
};

const execute = async (config) => {
	const context = Object.freeze(await generateContext(config.context));
	const commands = config.commands;
	const undoErrors = [];

	for (let i = 0, l = commands.length; i < l; i += 1) {
		const command = commands[i];
		const [error] = await to(command.execute(context));

		if (error) {
			while (i--) {
				[undoError] = await to(commands[i].undo(context, error));

				if (undoError) {
					undoErrors.push();
				}
			}

			break;
		}
	}

	if (undoErrors.length) {
		context.logger.error(`Encountered ${undoErrors.length} while undoing:`);

		for (const error of undoErrors) {
			context.logger.error(error);
		}
	}
};

module.exports = { execute }