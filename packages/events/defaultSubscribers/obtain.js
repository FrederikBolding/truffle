const spinners = require("@truffle/spinners");
const OS = require("os");

module.exports = {
  initialization: function () {
    this.logger = console;
  },
  handlers: {
    "obtain:start": [
      function () {
        if (this.quiet) {
          return;
        }
        this.logger.log(`${OS.EOL}Starting obtain...`);
        this.logger.log(`==================${OS.EOL}`);
      }
    ],
    "obtain:succeed": [
      function ({ compiler }) {
        if (this.quiet) {
          return;
        }
        const { name, version } = compiler;
        this.logger.log(
          `    > successfully downloaded and cached version ${version} ` +
            `of the ${name} compiler.${OS.EOL}`
        );
      }
    ],
    "obtain:fail": [
      function () {
        if (this.quiet) {
          return;
        }

        spinners.fail("obtain-handler");
        this.logger.log("Unbox failed!");
      }
    ],

    "downloadCompiler:start": [
      function ({ attemptNumber }) {
        if (this.quiet) {
          return;
        }
        spinners.add("obtain-handler", {
          text: `Downloading compiler. Attempt #${attemptNumber}.`,
          color: "red"
        });
      }
    ],
    "downloadCompiler:succeed": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.succeed("obtain-handler");
      }
    ],
    "fetchSolcList:start": [
      function ({ attemptNumber }) {
        if (this.quiet) {
          return;
        }
        spinners.add("obtain-handler", {
          text: `Fetching solc version list from solc-bin. Attempt #${attemptNumber}`,
          color: "yellow"
        });
      }
    ],
    "fetchSolcList:succeed": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.succeed("obtain-handler");
      }
    ],
    "fetchSolcList:fail": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.fail("obtain-handler");
      }
    ]
  }
};
