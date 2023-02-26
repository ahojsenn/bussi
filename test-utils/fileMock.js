const path = require('path');

module.exports = {
  process(sourceText, sourcePath, options) {
    console.log("fileMock: sourcePath: ", sourcePath)
    return {
      code: `module.exports = ${JSON.stringify(path.basename(sourcePath))};`,
    };
  },
};