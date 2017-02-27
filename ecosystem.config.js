module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
        {
            name: "galilee-server",
            script: "main.js",

            // Run pm2 with --env production
            env_production: {
                GALILEE: "production"
            },

            // Run pm2 with --env development
            env_development: {
                GALILEE: "development",
                DEBUG: "*"
            },
        }
    ]
}
