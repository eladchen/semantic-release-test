const loggerContext = ({ prefix, logLevel }) => {
    const clean = (...args) => args.filter(Boolean).join(" ");
    const prefixFn = typeof prefix === "function" ? prefix : () => prefix;

    const shouldLog = (level) => logLevel >= level;
    const logger = {
        info(message) {
            shouldLog(1) && console.info(clean("info ", prefixFn(), message));
        },

        warn(message) {
            shouldLog(2) && console.warn(clean("warn ", prefixFn(), message));
        },

        // error: Error | string
        error(messageOrError) {
            shouldLog(3) && console.error(clean("error", prefixFn(), messageOrError));

            if (messageOrError instanceof Error) {
                shouldLog(3) && console.error(messageOrError.stack);
            }
        },

        debug(message) {
            shouldLog(4) && console.debug(clean("debug", prefixFn(), message));
        }
    };

    return (context) => {
        Object.defineProperty(context, "logger", {
            configurable: false,
            enumerable: false,

            get() {
                return logger;
            }
        });
    };
}

module.exports = { loggerContext };