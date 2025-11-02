const Promise = require("bluebird");
const path = require("path");
const fs = Promise.promisifyAll(require("fs"));
const pool = require("../configs/dbConfig");
const difference = require('lodash/difference');
const connectToDatabase = require("../services/dbConnectionService");

(async () => await connectToDatabase())();

const migrateData = async (queryData, fileNames) => {
  try {
    await pool.query(queryData);
    const existingFileNames = await fs
      .readFileAsync(path.join(__dirname, "migratedFiles.txt"), "utf8")
      .then((data) => data.split("/n").map((fileName) => fileName.trim()));
    fs.writeFileSync(
      path.join(__dirname, "migratedFiles.txt"),
      [...existingFileNames, ...fileNames].join("\n")
    );
  } catch (error) {
    console.error("Error in migrate.migrateData --- ", error);
    throw new Error(error);
  }
};

const processMigrations = async () => {
  try {
    const orderedFileNames = await fs
      .readFileAsync(path.join(__dirname, "order.txt"), "utf8")
      .then((data) =>
        data
          .split("\n")
          .map((fileName) => fileName.trim())
          .filter((fileName) => !fileName.startsWith("#"))
      );
    const migratedFileNames = [];
    if (fs.existsSync(path.join(__dirname, "migratedFiles.txt"))) {
      const fileNames = await fs
        .readFileAsync(path.join(__dirname, "migratedFiles.txt"), "utf8")
        .then((data) => data.split("\n").map((fileName) => fileName.trim()));
      migratedFileNames.push(...fileNames);
    } else {
      await fs.writeFileAsync(
        path.join(__dirname, "migratedFiles.txt"),
        ""
      );
    }
    const fileNames = difference(orderedFileNames, migratedFileNames);
    if (fileNames.length === 0) {
      console.log("Everything is up to date");
      process.exit(0);
    }
    console.log("SQL migrations to process:", fileNames);
    console.log("Processing migrations...");
    const data = await Promise.reduce(
      fileNames,
      async (sql, fileName) => {
        const sqlData = await fs.readFileAsync(
          path.join(__dirname, "migrationFiles", fileName.trim()),
          "utf8"
        );
        return `${sql}\n${sqlData}`;
      },
      ""
    );
    await migrateData(data, fileNames);
    console.log("Migrations processed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error in migrations.processMigrations --- ", error);
    process.exit(1);
  }
};

processMigrations();
