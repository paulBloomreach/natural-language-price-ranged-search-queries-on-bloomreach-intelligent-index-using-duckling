const duckling = require('./duckling'),
    searchModule = require('./searchModule'),
    express = require('express'),
    app = express(),
    port = 3000

app.get('/search', function(req, res) {
  console.log('query is:' + JSON.stringify(req.query))

  let thisContext = {
    thisInput: req.query.q,
    queryParameters: [],
    searchText: req.query.q
  }
  
  duckling.runDuckling(thisContext)
  .then((thisContext) => {
    return searchModule.search(thisContext)
  })
  .then((result) => {
    res.send({result});
    return
  })
  .catch((err) => {
    console.log(`request error %s`,err)
  })
});

app.listen(port);
console.log('Listening on port ' + port + '...');
