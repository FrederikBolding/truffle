import { Storage } from "./storage";

export type TruffleDBConfig = {
  databaseName: string;
  databaseEngine: string;
  databaseDirectory: string;
  modelDirectories?: string[];
};

export type ModelLookup = {
  [model: string]: { levelDB: { close: Function } };
};

export class TruffleDB {
  config: TruffleDBConfig;
  levelDB: { close: Function };
  models: ModelLookup;

  constructor(config?: TruffleDBConfig) {
    this.config = { ...TruffleDB.DEFAULTS, ...config };
    const {
      databaseName,
      databaseEngine,
      databaseDirectory,
      modelDirectories
    } = this.config;

    const { levelDB, models } = Storage.createStorage({
      databaseName,
      databaseDirectory,
      databaseEngine,
      modelDirectories
    });

    this.levelDB = levelDB;
    this.models = models;
  }

  async close() {
    await this.levelDB.close();
  }

  static get DEFAULTS(): TruffleDBConfig {
    return {
      databaseName: "truffledb",
      databaseEngine: "memory",
      databaseDirectory: "./db",
      modelDirectories: []
    };
  }
}
