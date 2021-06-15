const util = require("util"),
  https = require("https"),
  promise = require("promise"),
  { spawn } = require("child_process");

runDuckling = (thisContext) => {
  return new promise(function (resolve, reject) {
    try {
      global.console.log(
        "duckling: we are searching for: " + thisContext.thisInput
      );
      let receivedData = "";
      let thisProcess = spawn("/bin/sh", [
        "-c",
        "curl -XPOST http://127.0.0.1:8000/parse --data 'locale=en_GB&text=" +
          thisContext.thisInput +
          "'",
      ]);

      thisProcess.stdout.on("data", (data) => {
        receivedData += data;
      });

      thisProcess.stderr.on("data", (data) => {
        console.log("got data:" + data);
      });

      thisProcess.on("exit", (code, signal) => {
        receivedData = JSON.parse(receivedData);
        thisContext.duckling = receivedData;
        processDucklingElements(thisContext).then((thisContext) => {
          resolve(thisContext);
        });
      });
    } catch (err) {
      console.log("duckling error: " + err);
      reject(err);
    }
  });
};

processDucklingElements = (thisContext) => {
  return new promise(function (resolve, reject) {
    try {
      for (i = 0; i < thisContext.duckling.length; i++) {
        let thisDucklingElement = thisContext.duckling[i];
        if (
          thisDucklingElement.value.type == "interval" &&
          thisDucklingElement.dim == "amount-of-money"
        ) {
          let unitsUnknown = false;
          if (thisDucklingElement.value.from) {
            if (thisDucklingElement.value.from.unit == "unknown") {
              unitsUnknown = true;
            }
          }

          if (thisDucklingElement.value.to) {
            if (thisDucklingElement.value.to.unit == "unknown") {
              unitsUnknown = true;
            }
          }

          if (unitsUnknown == false) {
            //we are searching for a sale-price range.
            let under = "*";
            if (thisDucklingElement.value.to) {
              under = thisDucklingElement.value.to.value;
            }

            let over = "*";
            if (thisDucklingElement.value.from) {
              over = thisDucklingElement.value.from.value;
            }

            let thisSearchParam =
              "fq=sale_price:[" + over + " TO " + under + "]";
            thisContext.queryParameters.push(thisSearchParam);
            thisContext.searchText = thisContext.searchText.replace(thisDucklingElement.body, "");
          }
        }
      }
      resolve(thisContext);
    } catch (err) {
      console.log("duckling element processing error: " + err);
      reject(err);
    }
  });
};

module.exports = {
  runDuckling,
};
