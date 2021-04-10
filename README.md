## Demo

> Requirements [here](./requirements.md)

## Install

```
npm install
```

## Start

```bash
npm start
# Default server port `4321`
# can be configured in  `config.js`
```

## What?

It is basically a CSV to JSON parser that writes the results in a file using
streaming.

There is an example csv file in this repo called `10.csv` that holds `10` items
to be processed.

I tested with `100`, `1000`, `10000` and `100000` items. The server use
streaming all the way down so altough i couldn't test with heavy workload it
should allow to respond to very big file uploads while keeping low memory
footprint.

I staret working exactly as the requirements suggested, but at some point I
deviated an go for a more tech concept in which performance matters, ups!

There are obviously plenty of things to do here, this is just the tip of the
iceberg.
