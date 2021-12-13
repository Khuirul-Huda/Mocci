class Config {

    //Database Section
    static FirebaseBucket() {
        return process.env.FIREBASE_STORAGE_BUCKET
    }
    static FirebaseApiKey() {
        return process.env.FIREBASE_API_KEY
    }
    static FirebaseDatabaseUrl() {
        return process.env.FIREBASE_DATABASE_URL
    }
    static FirebaseAuthDomain() {
        return process.env.FIREBASE_AUTH_DOMAIN
    }
    //General config
    static debugMode() {
        return (process.env.DEBUG === 0) ? false : true
    }
    static botToken() {
        return (process.env.BOT_TOKEN === '') ? null : process.env.BOT_TOKEN
    }
    static testGuildId() {
        return (process.env.TEST_GUILD_ID === '') ? null : process.env.TEST_GUILD_ID
    }
    static allowShellExecution() {
        return process.env.ALLOW_SHELL_EXEC
    }

}

module.exports = {
    Config
}