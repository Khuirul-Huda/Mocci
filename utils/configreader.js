class Config {
    // Database Section
    static get firebaseBucket() {
        return process.env.FIREBASE_STORAGE_BUCKET || '';
    }
    static get firebaseApiKey() {
        return process.env.FIREBASE_API_KEY || '';
    }
    static get firebaseDatabaseUrl() {
        return process.env.FIREBASE_DATABASE_URL || '';
    }
    static get firebaseAuthDomain() {
        return process.env.FIREBASE_AUTH_DOMAIN || '';
    }
    // General config
    static get debugMode() {
        return process.env.DEBUG === '1' || process.env.DEBUG === 'true';
    }
    static get botToken() {
        return process.env.BOT_TOKEN || null;
    }
    static get testGuildId() {
        const val = process.env.TEST_GUILD_ID;
        if (!val || val === 'optional') return null;
        return val;
    }
    static get allowShellExecution() {
        return process.env.ALLOW_SHELL_EXEC === 'true' || process.env.ALLOW_SHELL_EXEC === '1';
    }
    static validateEnv() {
        if (!this.botToken) throw new Error('BOT_TOKEN is required in environment variables.');
    }
}

module.exports = {
    Config
};