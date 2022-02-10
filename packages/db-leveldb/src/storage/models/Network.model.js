const Model = require("../Model");
const { soliditySha3 } = require("web3-utils");

class Network extends Model {
  name;
  networkId;
  historicBlock;
  genesis;
  ancestors;
  descendants;
  possibleAncestors;
  possibleDescendants;

  async beforeSave() {
    const newId = this.generateID();

    // Key exists in db, but data fields have changed so remove old key
    // This could also become a batch operation and would then be atomic
    if (this.id && this.id !== newId) {
      await Network.delete(this.id);
    }
    this.id = newId;
  }

  generateID() {
    return soliditySha3(
      JSON.stringify(this.networkId) + JSON.stringify(this.historicBlock)
    );
  }
}

module.exports = Network;