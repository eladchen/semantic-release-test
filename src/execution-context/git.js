const execute = require("execa");

const getHeadBranchName = async () => {
    const { stdout } = execute("git", ["rev-parse", "--abbrev-ref", "HEAD"]);

    return stdout;
};

const getHeadSha = async () => {
    const { stdout } = execute("git", ["rev-parse", "HEAD"]);

    return stdout;
};

const getRefTags = async (ref) => {
    const { stdout } = execute("git", ["tag", `--merged=${ref}`, `--format='%(refname:strip=2):%(objectname)'`]);

    return stdout;
};

// List tags of a branch:
// source: https://stackoverflow.com/a/39084124/1614199
// git tag --merged <ref> --format '%(objectname)' (since git v2.7.x)
async function gitContext(context) {
    const isGitRepo = true; // throw if false
    const headBranchSha = getHeadSha(); // git rev-parse HEAD
    const headBranchName = getHeadBranchName();
    const tags = getRefTags();

    context.git = Object.freeze({
        branch: Object.freeze({
            sha: headBranchSha,
            name: headBranchName,

            get tags() {
                return JSON.parse(JSON.stringify(tags));
            }
        }),
    });
}

module.exports = { gitContext }