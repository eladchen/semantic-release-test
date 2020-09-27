const execute = require("execa");

const getOldestCommitSha = async () => {
    const { stdout } = await execute("git", ["log", "--oneline", "--reverse",  "--pretty=format:'%H'"]);

    return stdout.split("\n")[0];
};

const getCommitsSha = async (baseRef, headRef) => {
    const { stdout } = await execute("git", ["log", "--oneline", "--pretty=format:%H", `${baseRef}..${headRef}`]);

    return stdout.split("\n");
};

const getCommitsShaRange = async (tags, headSha) => {
    const commitsShaRange = [];

    if (tags.length) {
        const latestTagSha = tags[tags.length - 1].sha;

        if (latestTagSha !== headSha) {
            commitsShaRange.push(...await getCommitsSha(latestTagSha, headSha));
        }
    }
    else {
        const oldestCommitSha = getOldestCommitSha();

        commitsShaRange.push([ oldestCommitSha, ...await getCommitsSha(oldestCommitSha, headSha) ]);
    }

    return commitsShaRange;
};

const getCommits = async (commitsSha) => {
    const commits = [];
    const separator = "--- separator ---"
    const args = ["log", "-n 1", "--oneline", `--pretty=format:%H${separator}%B`];

    for (const commitSha of commitsSha) {
        const { stdout } = await execute("git", [...args, commitSha]);
        const [sha, subjectAndBody] = stdout.split(separator);

        commits.push({sha, subjectAndBody});
    }

    return commits;
};

const gitCommitsContext = async (context) => {
    const commitsShaRange = await getCommitsShaRange(context.git.head.tags, context.git.head.sha);
    const commits = await getCommits(commitsShaRange);

    Object.defineProperty(context, "commits", {
        configurable: false,
        enumerable: false,

        get() {
            return JSON.parse(JSON.stringify(commits));
        }
    });
};

module.exports = { gitCommitsContext }