const conventionalCommitsParser = require("conventional-commits-parser").sync;

const VERSIONS = ["major", "minor", "patch"];

const isFn = (argument) => typeof argument === "function";

const getConventionalCommits = (rawCommits, parserOpts) => {
    const conventionalCommits = [];

    for (const commit of rawCommits) {
        conventionalCommits.push(conventionalCommitsParser(commit.subjectAndBody, parserOpts));
    }

    return conventionalCommits;
};

const gitConventionalReleaseContext = (options) => {
    let { conventionalPreset } = options;
    const { commitsFilter } = options;

    if (!conventionalPreset) {
        throw new Error("conventionalPreset is required");
    }

    return async (context) => {
        const preset = await Promise.resolve(conventionalPreset);
        const commits = getConventionalCommits(context.commits, preset.parserOpts);
        const filteredCommits = isFn(commitsFilter) ? commitsFilter(commits) : commits;
        const bump = preset.recommendedBumpOpts.whatBump(filteredCommits);
        const reason = bump.reason;
        const type = VERSIONS[bump.level];

        context.release = Object.freeze({
            type,
            reason,
            conventionalCommits: filteredCommits
        });
    }
};

module.exports = { gitConventionalReleaseContext }