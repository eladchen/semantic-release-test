async function verifyConditions(pluginConfig, context) {
	console.log(pluginConfig, context);

	return true;
}

async function prepare(pluginConfig, context) {
	throw new Error();
}

// Generate a changelog -> CHANGELOG.md
// Generate a build-info.txt -> build/build-info.txt
// Publish a docker image
// Update kubernetes
// Commit and push files

module.exports = { verifyConditions, prepare }