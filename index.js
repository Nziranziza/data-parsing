const fs = require("fs");
const path = require("path");

const FIELDS = {
  "column name": "name",
  width: "width",
  datatype: "type",
};

/**
 * Interpret the specification with some validity check
 * @param {string[]} specs
 * @returns {object[]}
 */
function interpretSpecs(specs) {
  if (!specs.length) {
    console.log("no specifications given");
    return;
  }
  const fields = specs[0].split(",");
  const unknowField = fields.find((field) => !FIELDS[field]);
  if (unknowField) {
    console.log("Invalid spec file");
    return [];
  }
  let results = [];
  specs.slice(1).forEach((spec) => {
    let column = {};
    spec.split(",").forEach((specFieldValue, specFieldIndex) => {
      const specField = FIELDS[fields[specFieldIndex]];
      column = {
        ...column,
        [specField]:
          specField === FIELDS.width ? Number(specFieldValue) : specFieldValue,
      };
    });
    results = [...results, column];
  });
  return results.reduce((prev, curr) => {
    if (!prev.length) {
      return [{ ...curr, start: 0 }];
    }
    return [
      ...prev,
      {
        ...curr,
        start:
          prev[prev.length - 1].start + Number(prev[prev.length - 1].width),
      },
    ];
  }, []);
}

/**
 * Convert a string to respective data type
 * @param {string} value
 * @param {string} type
 * @returns {*}
 */
function formatValueByType(value, type) {
  if (type === "BOOLEAN") {
    return Boolean(Number(value));
  }
  if (type === "INTEGER") {
    return Number(value);
  }
  return value;
}

/**
 * Apply rules to the data and generate meaningful information
 * The output is an array of stringify object of information
 * @param {string[]} data
 * @param {object[]} rules
 * @returns {string[]}
 */
function interpretData(data, rules) {
  if (!data.length) {
    console.error("no data provided");
    return;
  }
  if (!rules.length) {
    console.log("No specification provided");
    return;
  }
  return data
    .map((item) => {
      let res = {};
      rules.forEach(({ name, width, type, start }) => {
        res = {
          ...res,
          [name]: formatValueByType(
            item.slice(start, start + width).trim(),
            type
          ),
        };
      });
      return JSON.stringify(res);
    })
    .join("\n");
}

/**
 * Given filename with extension and the extension
 * This function returns the filename without extension
 * @param {string} filename
 * @param {string} ext
 * @returns {string}
 */
function removeExt(filename, ext) {
  return filename.split(ext)[0];
}

/**
 * Given the speciFile name and dataFile name
 * This function reads both files, compare them
 * and generate the output file
 * @param {string} specFile
 * @param {string} dataFile
 */
function processFiles(specFile, dataFile) {
  fs.readFile(`./specs/${specFile}`, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
    }
    const specs = data.split("\r\n").filter((line) => line);
    const columnRules = interpretSpecs(specs);
    fs.readFile(`./data/${dataFile}`, "utf-8", (err, data) => {
      if (err) {
        console.error(err);
      }
      const lines = data.split("\n").filter((line) => line);
      const info = interpretData(lines, columnRules);
      const outputDir = "./output";
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      fs.writeFile(
        `${outputDir}/${removeExt(dataFile, ".txt")}.ndjson`,
        info,
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
    });
  });
}

const dataPath = path.join(__dirname, "/data");
const specPath = path.join(__dirname, "/specs");

fs.readdir(specPath, function (err, files) {
  if (err) {
    console.log(err);
    return;
  }
  const specFiles = files.filter((el) => path.extname(el) === ".csv");
  /**
   * Should check for data files
   * only if spec files exist
   */
  if (specFiles.length) {
    fs.readdir(dataPath, function (err, files) {
      if (err) {
        console.log(err);
        return;
      }
      const dataFiles = files.filter((el) => path.extname(el) === ".txt");
      if (!dataFiles.length) {
        console.log("No data files available");
        return;
      }
      /**
       * Map over spec files and find corresponding data file
       */
      specFiles.forEach((specFile) => {
        const specifiedDataFiles = dataFiles.filter(
          (dataFile) => dataFile.split("_")[0] === removeExt(specFile, ".csv")
        );
        if (!specifiedDataFiles.length) {
          console.log(`No data file for specification ${specFile}`);
          return;
        }
        specifiedDataFiles.forEach((dataFile) => {
          processFiles(specFile, dataFile);
        });
      });
    });
  }
});
