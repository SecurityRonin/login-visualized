import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    use: {
        baseURL: 'http://localhost:3010',
        headless: true,
    },
    webServer: {
        command: 'node server.js 3010',
        port: 3010,
        reuseExistingServer: true,
        timeout: 10000,
    },
});
