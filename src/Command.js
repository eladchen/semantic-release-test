class Command {
	async execute(context) {}

	async undo(context, error) {}
}

module.exports = { Command }