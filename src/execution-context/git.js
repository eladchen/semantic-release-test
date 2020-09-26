const execute = require("execa");
const semver = require("semver");

const getGitVersion = async () => {
    const { stdout } = await execute("git", ["--version"]);

    return stdout.split(" ")[2];
};

const getHeadSha = async () => {
    const { stdout } = await execute("git", ["rev-parse", "HEAD"]);

    return stdout;
};

/**
 * This method requires the git client version to be >= 2.7.0
 * source: https://stackoverflow.com/a/39084124/1614199
 */
const getHeadTags = async () => {
    const minGitVersion = "2.7.0"
    const getVersion = await getGitVersion();

    if (semver.satisfies(getVersion, `>= ${minGitVersion}`)) {
        const tags = [];
        const separator = ":"
        const { stdout } = await execute("git", [
            "tag",
            `--merged=HEAD`,
            `--format=%(refname:strip=2)${separator}%(objectname)`
        ]);

        for (const tag of stdout.split("\n")) {
            const [name, sha] = tag.split(separator);

            tags.push({
                sha,
                name,
                ref: `refs/tags/${name}`
            });
        }

        return tags;
    } //
    else {
        throw new Error(`Git version ${minGitVersion} is required. Found ${getVersion}.`);
    }
};

const getHeadBranchName = async () => {
    const { stdout } = await execute("git", ["rev-parse", "--abbrev-ref", "HEAD"]);

    return stdout;
};

const gitContext = async (context) => {
    const [headSha, headTags, headBranchName] = await Promise.all([
        getHeadSha(),
        getHeadTags(),
        getHeadBranchName()
    ]);

    context.git = Object.freeze({
        head: Object.freeze({
            sha: headSha,
            name: headBranchName,

            get tags() {
                return JSON.parse(JSON.stringify(headTags));
            }
        }),
    });
};

module.exports = { gitContext }