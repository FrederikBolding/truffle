const spinners = require("@truffle/spinners");

module.exports = {
  initialization: function () {
    this.logger = this.logger || console;
    this.pendingTransactions = [];
  },
  handlers: {
    "rpc:request": [
      function (event) {
        const { payload } = event;
        if (payload.method === "eth_sendTransaction") {
          // TODO: Do we care about ID collisions?
          this.pendingTransactions[payload.id] = payload;

          spinners.add("dashboard-handler", {
            text: `Waiting for transaction signature. Please check your wallet for a transaction approval message.`,
            color: "red"
          });
        }
      }
    ],
    "rpc:result": [
      function (event) {
        let { payload, error, result } = event;

        if (payload.method === "eth_sendTransaction") {
          error = error || result.error;
          if (error) {
            const errMessage = `Transaction submission failed with error ${error.code}: '${error.message}'`;

            spinners.fail("dashboard-handler", errMessage);
          } else {
            spinners.remove("dashboard-handler");
          }

          delete this.pendingTransactions[payload.id];
        }
      }
    ]
  }
};
