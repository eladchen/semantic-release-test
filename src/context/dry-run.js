const dryRunContext = (dryRun = false) => {
    return (context) => {
        context.dryRun = dryRun === true;
    }
}

module.exports = { dryRunContext };