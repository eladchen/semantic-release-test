const getStream = require('get-stream');
const intoStream = require('into-stream');
const conventionalChangelogWriter = require("conventional-changelog-writer");

const isFn = (argument) => typeof argument === "function";

const getConventionalChangelog = async (conventional) => {
    const { commits, writerContext, writerOpts } = conventional;
    const stream = intoStream.object(commits).pipe(conventionalChangelogWriter(writerContext, writerOpts));

    return getStream(stream);
};

const gitConventionalChangelogContext = (options) => {
    let { conventionalPreset, conventionalChangeLogWriterContext } = options;

    if (!conventionalPreset) {
        throw new Error("conventionalPreset is required");
    }

    return async (context) => {
        const preset = await Promise.resolve(conventionalPreset);
        const changelog = await getConventionalChangelog({
            commits: context.release.conventionalCommits,
            writerOpts: preset.writerOpts,
            writerContext: isFn(conventionalChangeLogWriterContext) ? conventionalChangeLogWriterContext(context) : {}
        });

        context.changelog = changelog;
    }
};

module.exports = { gitConventionalChangelogContext }