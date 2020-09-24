/**
 * semantic-release docs: https://semantic-release.gitbook.io/semantic-release
 *
 * Plugins:
 *
 *  @semantic-release/commit-analyzer
 *  Determine whether a release should be made, and its type.
 *  https://github.com/semantic-release/commit-analyzer
 *
 *  @semantic-release/release-notes-generator
 *  Generate release notes, which can be read in the context parameter of other plugins.
 *  For example, the changelog plugin uses when writing the changes to a file.
 *  https://github.com/semantic-release/release-notes-generator
 *
 *  @semantic-release/changelog
 *  Write release notes to a file (Notes are passed in plugins context parameter).
 *  https://github.com/semantic-release/changelog
 *
 *  @semantic-release/exec
 *  Run commands during arbitrary release steps (instead of writing a plugin).
 *  String interpolation is available, using: https://github.com/semantic-release/git/blob/master/lib/prepare.js
 *  https://github.com/semantic-release/exec
 *
 *  @semantic-release/git
 *  Perform commit and push of files generated during a release. (tricky with protected branches)
 *  https://github.com/semantic-release/git
 *
 *  @semantic-release/github
 *  Create a Github release, and comment on relevant pull-requests / issues
 *  https://github.com/semantic-release/github
 */

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

    plugin("@semantic-release/exec", {
      prepareCmd: cmd(`node release-scripts/create-build-info.js`, [
        `--file-path ${buildInfoFilePath}`,
        `--build-version \${nextRelease.version}`,
      ]),

      publishCmd: cmd(`node release-scripts/publish-docker-image.js`, [
        `--image-tag \${nextRelease.version}`,
        `--image-name ${process.env.DOCKER_IMAGE_NAME}`,

        `--registry ${process.env.DOCKER_REGISTRY}`,
        `--registry-user-name ${process.env.DOCKER_REGISTRY_USER_NAME}`,
      ]),
    }),

    plugin("@semantic-release/exec", {
      publishCmd: cmd(`node release-scripts/update-k8s-deployment.js`, [
        `--deployment-image ${process.env.DOCKER_IMAGE_NAME}:\${nextRelease.version}`,
        `--deployment-name ${process.env.K8S_DEPLOYMENT_NAME}`,
        `--deployment-host ${process.env.APP_HOST}`,
      ]),
    }),

    plugin("@semantic-release/exec", {
      publishCmd: cmd(`node release-scripts/validate-deployment.js`, [`--expected-version \${nextRelease.version}`]),
    }),

    plugin("@semantic-release/git", {
      assets: ["package.json", changeLogFilePath],
    }),

    plugin("@semantic-release/github", {
      assets: [{ path: buildInfoFilePath }],
    }),
  ],
};
