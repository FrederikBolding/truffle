const debugModule = require("debug");
const debug = debugModule("lib:debug:cli");

const fs = require("fs-extra");
const path = require("path");

const Debugger = require("@truffle/debugger");
const DebugUtils = require("@truffle/debug-utils");
const Codec = require("@truffle/codec");
const { fetchAndCompileForDebugger } = require("@truffle/fetch-and-compile");

const { DebugInterpreter } = require("./interpreter");
const { DebugCompiler } = require("./compiler");

const spinners = require("@truffle/spinners");

class CLIDebugger {
  constructor(config, { compilations, txHash } = {}) {
    this.config = config;
    this.compilations = compilations;
    this.txHash = txHash;
  }

  async run() {
    this.config.logger.log("Starting Truffle Debugger...");

    const session = await this.connect();

    // initialize prompt/breakpoints/ui logic
    const interpreter = await this.buildInterpreter(session);

    return interpreter;
  }

  async connect() {
    // get compilations (either by shimming compiled artifacts,
    // or by doing a recompile)
    const compilations = this.compilations || (await this.getCompilations());

    // invoke @truffle/debugger
    const session = await this.startDebugger(compilations);

    return session;
  }

  async fetchExternalSources(bugger) {
    spinners.add(
      "debug-cli-fetch",
      "Getting and compiling external sources..."
    );
    const {
      fetch: badAddresses,
      fetchers: badFetchers,
      compile: badCompilationAddresses
    } = await fetchAndCompileForDebugger(bugger, this.config); //Note: mutates bugger!!
    if (
      badAddresses.length === 0 &&
      badFetchers.length === 0 &&
      badCompilationAddresses.length === 0
    ) {
      spinners.succeed("debug-cli-fetch");
    } else {
      let warningStrings = [];
      if (badFetchers.length > 0) {
        warningStrings.push(
          `Errors occurred connecting to ${badFetchers.join(", ")}.`
        );
      }
      if (badAddresses.length > 0) {
        warningStrings.push(
          `Errors occurred while getting sources for addresses ${badAddresses.join(
            ", "
          )}.`
        );
      }
      if (badCompilationAddresses.length > 0) {
        warningStrings.push(
          `Errors occurred while compiling sources for addresses ${badCompilationAddresses.join(
            ", "
          )}.`
        );
      }
      // simulate ora's "warn" feature
      spinners.update({
        text: `⚠ ${warningStrings.join("  ")}`,
        color: "yellow",
        status: "stopped"
      });
    }
  }

  async getCompilations() {
    //if compileNone is true and configFileSkiped
    //we understand that user is debugging using --url and does not have a config file
    //so instead of resolving compilations, we return an empty value
    if (this.config.compileNone && this.config.configFileSkipped) {
      return [];
    }

    let artifacts;
    artifacts = await this.gatherArtifacts();
    if ((artifacts && !this.config.compileAll) || this.config.compileNone) {
      let shimmedCompilations =
        Codec.Compilations.Utils.shimArtifacts(artifacts);
      //if they were compiled simultaneously, yay, we can use it!
      //(or if we *force* it to...)
      if (
        this.config.compileNone ||
        shimmedCompilations.every(DebugUtils.isUsableCompilation)
      ) {
        debug("shimmed compilations usable");
        return shimmedCompilations;
      }
      debug("shimmed compilations unusable");
    }
    //if not, or if build directory doesn't exist, we have to recompile
    return await this.compileSources();
  }

  async compileSources() {
    spinners.add("debug-compile-spinner", "Compiling your contracts...");

    const compilationResult = await new DebugCompiler(this.config).compile({
      withTests: this.config.compileTests
    });
    debug("compilationResult: %O", compilationResult);

    spinners.succeed("debug-compile-spinner");

    return Codec.Compilations.Utils.shimCompilations(compilationResult);
  }

  async startDebugger(compilations) {
    const startMessage = DebugUtils.formatStartMessage(
      this.txHash !== undefined
    );
    let bugger;
    if (!this.config.fetchExternal) {
      //ordinary case, not doing fetch-external
      spinners.add("debug-start-spinner", startMessage);
      bugger = await Debugger.forProject({
        provider: this.config.provider,
        compilations
      });
      if (this.txHash !== undefined) {
        try {
          debug("loading %s", this.txHash);
          await bugger.load(this.txHash);
          spinners.succeed("debug-start-spinner");
        } catch (_) {
          debug("loading error");
          spinners.fail("debug-start-spinner");
          //just start up unloaded
        }
      } else {
        spinners.succeed("debug-start-spinner");
      }
    } else {
      //fetch-external case
      //note that in this case we start in light mode
      //and only wake up to full mode later!
      //also, in this case, we can be sure that txHash is defined
      bugger = await Debugger.forTx(this.txHash, {
        provider: this.config.provider,
        compilations,
        lightMode: true
      }); //note: may throw!
      await this.fetchExternalSources(bugger); //note: mutates bugger!
      spinners.add("debug-start-spinner", startMessage);
      await bugger.startFullMode();
      //I'm removing the failure check here because I don't think that can
      //actually happen
      spinners.succeed("debug-start-spinner");
    }
    return bugger;
  }

  async buildInterpreter(session) {
    return new DebugInterpreter(this.config, session, this.txHash);
  }

  async gatherArtifacts() {
    // Gather all available contract artifacts
    // if build directory doesn't exist, return undefined to signal that
    // a recompile is necessary
    if (!fs.existsSync(this.config.contracts_build_directory)) {
      return undefined;
    }
    const files = fs.readdirSync(this.config.contracts_build_directory);

    let contracts = files
      .filter(filePath => {
        return path.extname(filePath) === ".json";
      })
      .map(filePath => {
        return path.basename(filePath, ".json");
      })
      .map(contractName => {
        return this.config.resolver.require(contractName);
      });

    await Promise.all(
      contracts.map(abstraction => abstraction.detectNetwork())
    );

    return contracts;
  }
}

module.exports = {
  CLIDebugger
};
