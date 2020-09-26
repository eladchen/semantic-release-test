const { Command } = require("../Command");
const { execute } = require("../execute");

class GenerateChangeLogCommand extends Command {
	constructor(filePath) {
		super();
		
		this._filePath = filePath;
	}

	async execute(context) {
		console.log(`${this._filePath} created`);
	}

	async undo(context, error) {
		console.log(`${this._filePath} deleted`);
	}
}

class FailingCommand extends Command {
	constructor() {
		super();
	}

	async execute(context) {
		throw new Error("Something went wrong...")
	}

	async undo(context, error) {
		console.log("I will never be called")
	}
}

// CreateGitTagCommand
//  - verify authentication
// 	- verify the current branch is not behind its remote counterpart

execute({
	context: [],
	commands: [
		new GenerateChangeLogCommand("CHANGELOG.md"),
		new FailingCommand(),
	]
})