const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 1366,
  viewportHeight: 900,
  // DemoQA has a fixed footer; centering avoids elements being covered on click.
  scrollBehavior: 'center',
  defaultCommandTimeout: 8000,
  pageLoadTimeout: 60000,
  requestTimeout: 10000,
  responseTimeout: 30000,
  video: false,
  screenshotOnRunFailure: true,
  screenshotsFolder: 'reports/screenshots',
  downloadsFolder: 'reports/downloads',
  retries: {
    runMode: 1,
    openMode: 0,
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'reports/html',
    charts: true,
    reportPageTitle: 'DemoQA - Cypress Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  expose: {
    grepOmitFiltered: true,
    blockThirdParty: true,
  },
  e2e: {
    baseUrl: 'https://demoqa.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    testIsolation: true,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      const { plugin: cypressGrepPlugin } = require('@cypress/grep/plugin');
      cypressGrepPlugin(config);

      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(rows) {
          console.table(rows);
          return null;
        },
      });

      return config;
    },
  },
});
