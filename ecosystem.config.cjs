const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
    apps: [{
        name: "saas-app",
        script: "./dist/index.cjs",
        cwd: "/var/www",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: "production",
            ...process.env // Inject loaded env vars
        }
    }]
};
