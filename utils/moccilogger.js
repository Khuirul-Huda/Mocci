
require('colors');

class MocciLogging {
    static get DEBUG() { return 1; }
    static get INFO() { return 2; }
    static get WARN() { return 3; }
    static get CRITICAL() { return 4; }
    static get isDEBUG() {
        return process.env.DEBUG === '1' || process.env.DEBUG === 'true';
    }

    /**
     * Log a message with a given level.
     * @param {string} message
     * @param {number} level
     */
    static log(message, level = MocciLogging.INFO) {
        if (level > 4 || level <= 0) return;
        const prefix =
            level === MocciLogging.DEBUG ? '[DEBUG]' :
            level === MocciLogging.INFO ? '[INFO]' :
            level === MocciLogging.WARN ? '[WARN]' : '[CRITICAL]';
        const output = `${prefix} ${message}`;
        if (level === MocciLogging.DEBUG && !MocciLogging.isDEBUG) return;
        switch (level) {
            case MocciLogging.DEBUG:
                console.log(output.white); break;
            case MocciLogging.INFO:
                console.log(output.blue); break;
            case MocciLogging.WARN:
                console.log(output.yellow); break;
            case MocciLogging.CRITICAL:
                console.log(output.red); break;
            default:
                console.log(output);
        }
    }
}

module.exports = {
    MocciLogging
};
