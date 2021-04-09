const express = require('express');

const PORT = 4321;

const app = express();

app.get('/', (req, res) => {
  res.json({
    hello: 'world',
  });
});

app.listen(PORT, () => {
  console.info('server listengin on', PORT);
});
