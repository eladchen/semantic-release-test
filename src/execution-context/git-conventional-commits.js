const execute = require("execa");
const conventionalCommitsParser = require("conventional-commits-parser").sync;
const conventionalCommitsPreset = require("conventional-changelog-conventionalcommits");

// Recommend next version: (How do we specify the range of commits?)
// https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-recommended-bump#conventional-recommended-bump
// - preset https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits

// https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser

// https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.1.0/README.md

const getOldestCommitSha = async () => {
    const { stdout } = await execute("git", ["log", "--oneline", "--reverse",  "--pretty=format:'%H'"]);

    return stdout.split("\n")[0];
};

const getCommitsSha = async (baseRef, headRef) => {
    const { stdout } = await execute("git", ["log", "--oneline", "--boundary", "--pretty=format:'%H'", `${baseRef}..${headRef}`]);

    return stdout.split("\n");
};

const getCommitsShaRange = async (context) => {
    const tags = context.git.head.tags;
    const headSha = context.git.head.sha;
    const commitsShaRange = [];

    if (tags.length) {
        const latestTagSha = tags[tags.length - 1].sha;

        if (latestTagSha !== headSha) {
            commitsShaRange.push(...await getCommitsSha(latestTagSha, headSha));
        }
    }
    else {
        commitsShaRange.push(...await getCommitsSha(getOldestCommitSha(), headSha));
    }

    return commitsShaRange;
};

const getCommits = async (commitsSha) => {
    const commits = [];
    const separator = "--- separator ---"
    const args = ["log", "-n 1", "--oneline", `--pretty=format:%H${separator}%B`];

    for (const commitSha of commitsSha) {
        const { stdout } = await execute("git", [...args, commitsSha]);
        const [sha, subjectAndBody] = stdout.split(separator);

        commits.push({sha, subjectAndBody});
    }

    return commits;
};

const gitConventionalReleaseContext = async (context) => {
    const parsedCommits = [];
    const commitsShaRange = await getCommitsShaRange(context);
    const commits = await getCommits(commitsShaRange);

    for (const commit of commits) {
        parsedCommits.push(conventionalCommitsParser(commit.subjectAndBody));
    }

    context.release = Object.freeze({
        nextVersion: "1.1.1", // nextVersion("major | minor | patch", previousVersion, next)
    });
};

module.exports = { gitConventionalCommitsContext }