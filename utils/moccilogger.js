require('colors')

const isdebug = (process.env.DEBUG === 1 ) ? true : false

class MocciLogging {

    constructor() {
        MocciLogging.log('MocciLogging Created', MocciLogging.DEBUG)
    }

    static get DEBUG() {
        return 1
    }

    static get INFO() {
        return 2
    }
    static get WARN() {
        return 3
    }
    static get CRITICAL() {
        return 4
    }
    static get isDEBUG() {
        return isdebug
    }

    /**
     * 
     * @param {text} message 
     * @param {number} level 
     * @returns 
     */
    static log(message, level = 2) {
        if (level > 4 || level <= 0) return
        const prefix = (level == 1) ? '[DEBUG]' : (level == 2) ? '[INFO]' : (level == 3) ? '[WARN]' : '[CRITICAL]'
        const separator = ' '
        const output = prefix + separator + message
        if (level == 1 && isdebug == 0) return
        console.log((level == 1) ? output.white : (level == 2) ? output.blue : (level == 3) ? output.yellow : output.red)
    }
    
    
}

module.exports = {
    MocciLogging
}
