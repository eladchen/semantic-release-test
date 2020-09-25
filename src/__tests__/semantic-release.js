const { Command } = require("../Command");
const { semanticRelease } = require("../semantic-release");
const semanticReleaseCommitAnalyzer = require("@semantic-release/commit-analyzer")

class GenerateChangeLogCommand extends Command {
	constructor(filePath) {
		super();
		
		this._filePath = filePath;
	}

	async execute(context) {
		console.log(`${this._filePath} created`);
	}

	async undo(context) {
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

	async undo(context) {
		console.log("I will never be called")
	}
}

// CreateGitTagCommand
//  - verify authentication
// 	- verify the current branch is not behind its remote counterpart

function gitContext(context) {
	// is this a git repo ? if not throw an error

	// Get the range of commits that are relevant to this run
	// Look for a method that does that
	const releaseType = semanticReleaseCommitAnalyzer();

	context.git = {
		releaseType,
		branch: "master"
	}
}

semanticRelease({
	context: [],
	commands: [
		new GenerateChangeLogCommand("CHANGELOG.md"),
		new FailingCommand(),
	]
})