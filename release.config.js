const plugin = (name, options) => [name, options];

const changeLogFilePath = "CHANGELOG.md";
const conventionalCommitsPreset = "conventionalcommits";
const buildInfoFilePath = "build/build-info.txt";

const cmd = (command, args) => {
  return `${command} ${args.join(" ")}`;
};

module.exports = {
  plugins: [
    plugin("@semantic-release/commit-analyzer", {
      preset: conventionalCommitsPreset,
      presetConfig: {},
    }),

    plugin("@semantic-release/release-notes-generator", {
      preset: conventionalCommitsPreset,
    }),

    plugin("@semantic-release/changelog", {
      changelogFile: changeLogFilePath,
    }),

    "/Users/elad/dev/github/semantic-release-test/release-scripts/semantic-release.js",

    // plugin("@semantic-release/exec", {
    //   verifyConditionsCmd: "false",

    //   prepareCmd: "false",

    //   publishCmd: "false",
    // }),

    plugin("@semantic-release/git", {
      assets: ["package.json", changeLogFilePath],
    }),
  ],
};
