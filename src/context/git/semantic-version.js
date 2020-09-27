const semver = require("semver");

// Documentation Notes:
// - Depends on context.git
// - Initial version is "0.0.0"
// - Assumes "v" is the version prefix
// - Uses 'semver' library & context.release.type to bump versions
const gitSemanticVersionContext = async (context) => {
    const tags = context.git.head.tags;
    const releaseType = context.release.type;
    const previousVersion = tags.length === 0 ? "0.0.0" : semver.clean(tags[tags.length - 1].name, { loose: true });
    const nextVersion = semver.inc(previousVersion, releaseType);

    context.version = Object.freeze({
        prefix: "v",
        previous: previousVersion,
        next: nextVersion,
    });
};

module.exports = { gitSemanticVersionContext }