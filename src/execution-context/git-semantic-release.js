const semanticReleaseCommitAnalyzer = require("@semantic-release/commit-analyzer")

// List tags of a branch:
// source: https://stackoverflow.com/a/39084124/1614199
// git tag --merged <ref> --format '%(objectname)' (since git v2.7.x)
function gitSemanticReleaseContext(context) {
    context.semanticRelease = Object.freeze({
        nextVersion: "1.1.1", // nextVersion("major | minor | patch", previousVersion, next)
    });
}