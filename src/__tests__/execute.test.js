const getConventionalCommitsPreset = require("conventional-changelog-conventionalcommits");

const { Command } = require("../Command");
const { execute } = require("../execute");
const { loggerContext } = require("../context/logger");
const { dryRunContext } = require("../context/dry-run");
const { gitHeadContext } = require("../context/git/head");
const { gitCommitsContext } = require("../context/git/commits");
const { gitSemanticVersionContext } = require("../context/git/semantic-version");
const { gitConventionalReleaseContext } = require("../context/git/conventional-release");
const { gitConventionalChangelogContext } = require("../context/git/conventional-changelog");

class PrintErrorCommand extends Command {
	constructor() {
		super();
	}

	async execute(context) {}

	async undo(context, error) {
		context.logger.error(error);
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
		context.logger.info("I will never be called")
	}
}

class PrintContextCommand extends Command {
	constructor(filePath) {
		super();

		this._filePath = filePath;
	}

	async execute(context) {
		context.logger.info("info");
		context.logger.warn("warn");
		context.logger.error("error");
		context.logger.debug("debug");

		// context.logger.info(JSON.stringify(context, null, 2));
	}

	async undo(context, error) {}
}

class GenerateChangeLogCommand extends Command {
	constructor(filePath) {
		super();

		this._filePath = filePath;
	}

	async execute(context) {
		context.logger.info(`${this._filePath} created`);
	}

	async undo(context, error) {
		context.logger.info(`${this._filePath} deleted`);
	}
}

// CreateGitTagCommand
//  - verify authentication
// 	- verify the current branch is not behind its remote counterpart
const conventionalCommitsPreset = getConventionalCommitsPreset();

const conventionalReleaseContext = gitConventionalReleaseContext({
	conventionalPreset: conventionalCommitsPreset,
});

const conventionalChangelogContext = gitConventionalChangelogContext({
	conventionalPreset: conventionalCommitsPreset,

	// docs: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer
	// example: https://github.com/semantic-release/release-notes-generator/blob/master/index.js#L62
	conventionalChangeLogWriterContext(context) {
		return {
			version: context.version.next,

			host: "https://github.com",
			owner: "eladchen",
			repository: "semantic-release-test",
			previousTag: `${context.version.prefix}${context.version.previous}`,
			currentTag: `${context.version.prefix}${context.version.next}`,
			linkCompare: true,
			linkReferences: true,
			issue: "issue",
			commit: "commit",
		}
	}
});

execute({
	context: [
		loggerContext({
			logLevel: 4,
			prefix: "[release-commands]",
			silent() { return false }
		}),
		dryRunContext(false),
		gitHeadContext,
		gitCommitsContext,
		conventionalReleaseContext,
		gitSemanticVersionContext,
		conventionalChangelogContext,
	],

	commands: [
		new PrintErrorCommand(),
		new PrintContextCommand(),
		new GenerateChangeLogCommand("CHANGELOG.md"),
		new FailingCommand(),
	]
})