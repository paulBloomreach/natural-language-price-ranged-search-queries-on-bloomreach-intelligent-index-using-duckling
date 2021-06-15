const util = require("util"),
  https = require("https"),
  promise = require("promise"),
  settings = require("./settings.json");

let search = (thisContext) => {
  return new promise(function (resolve, reject) {
    try {
      console.log(
        "bloomreach: we are searching for: " + thisContext.searchText
      );

      doSearch(thisContext).then((thisResult) => {
        console.log(JSON.stringify(thisContext));
        resolve(thisResult);
      });
    } catch (err) {
      console.log("search error:" + err);
      reject(err);
    }
  });
};

let doSearch = (thisContext) => {
  return new promise(function (resolve, reject) {
    try {
      let extraParams = "";

      for (i = 0; i < thisContext.queryParameters.length; i++) {
        extraParams += "&" + encodeURI(thisContext.queryParameters[i]);
      }

      thisContext.searchText = encodeURI(thisContext.searchText);

      let reqPath =
        "/api/v1/core/?account_id=" +
        settings.account_id +
        "&auth_key=" +
        settings.auth_key +
        "&domain_key=" +
        settings.domain_key +
        "&url=www.bloomique.com&ref_url=www.bloomique.com&request_type=search&rows=200&start=0&fl=pid%2Ctitle%2Csale_price%2Cthumb_image%2Curl%2Cdescription%2CRating&q=" +
        thisContext.searchText +
        "&search_type=keyword" +
        extraParams;

      let options = {
        hostname: "core.dxpapi.com",
        method: "GET",
        path: reqPath,
        port: 443,
      };

      req = https.request(options, (resp) => {
        let data = "";
        // A chunk of data has been recieved.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received.
        resp.on("end", () => {
          console.log(data);
          resolve(JSON.parse(data));
        });
      });
      req.end();
    } catch (err) {
      console.log("bang: " + err);
      reject(err);
    }
  });
};

module.exports = {
  search,
};
