const spinners = require("@truffle/spinners");
const OS = require("os");

const formatCommands = commands => {
  const names = Object.keys(commands);
  const maxLength = Math.max.apply(
    null,
    names.map(name => name.length)
  );

  return names.map(name => {
    const spacing = Array(maxLength - name.length + 1).join(" ");
    return `  ${name}: ${spacing}${commands[name]}`;
  });
};

module.exports = {
  initialization: function () {
    this.logger = console;
  },
  handlers: {
    "unbox:start": [
      function () {
        if (this.quiet) {
          return;
        }
        this.logger.log(`${OS.EOL}Starting unbox...`);
        this.logger.log(`=================${OS.EOL}`);
      }
    ],
    "unbox:preparingToDownload:start": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.add("unbox-handler", { text: "Preparing to download box" });
      }
    ],
    "unbox:preparingToDownload:succeed": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.succeed("unbox-handler");
      }
    ],
    "unbox:downloadingBox:start": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.add("unbox-handler", { text: "Downloading" });
      }
    ],
    "unbox:downloadingBox:succeed": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.succeed("unbox-handler");
      }
    ],
    "unbox:cleaningTempFiles:start": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.add("unbox-handler", { text: "Cleaning up temporary files" });
      }
    ],
    "unbox:cleaningTempFiles:succeed": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.succeed("unbox-handler");
      }
    ],
    "unbox:settingUpBox:start": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.add("unbox-handler", { text: "Setting up box" });
      }
    ],
    "unbox:settingUpBox:succeed": [
      function () {
        if (this.quiet) {
          return;
        }
        spinners.succeed("unbox-handler");
      }
    ],
    "unbox:succeed": [
      function ({ boxConfig }) {
        if (this.quiet) {
          return;
        }
        this.logger.log(`${OS.EOL}Unbox successful, sweet!${OS.EOL}`);

        const commandMessages = formatCommands(boxConfig.commands);
        if (commandMessages.length > 0) {
          this.logger.log("Commands:" + OS.EOL);
        }

        commandMessages.forEach(message => this.logger.log(message));
        this.logger.log("");

        if (boxConfig.epilogue) {
          this.logger.log(boxConfig.epilogue.replace("\n", OS.EOL));
        }
      }
    ],
    "unbox:fail": [
      function () {
        if (this.quiet) {
          return;
        }
        if (spinners.pick("unbox-handler")) {
          spinners.fail("unbox-handler");
        }
        this.logger.log("Unbox failed!");
      }
    ]
  }
};
