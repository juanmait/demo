# Coding Challenge

> 1 to 2 hours - NodeJS backend

You work on a product that receives potentially large files in CSV format,
process them and import their data into our database. However, providers do not
all use the same layout of columns. The order may differ between providers, they
may only send a subset of the columns, or they may include additional columns we
do not wish to capture.

# # Task

Build an API with a single endpoint that accepts a file upload in the CSV format
and the provider name that sent the file, looks up a configuration defining the
column layout and parses the CSV into either a file or - as a stretch goal -
into an in-memory database (see below).The columns we care about are defined
below in the “Columns” section.

### Columns

- UUID
- VIN (alphanumerical vehicle id)
- Make
- Model
- Mileage
- Year
- Price
- Zip Code
- Create Date
- Update Date

**You are responsible for**:

- choosing the framework/libraries/architecture you’ll be using
- defining the format of the configuration file and how it is stored/loaded.

**Stretch goals**

- use an in-memory database(e.g. SQLite, mongodb-memory-server) instead of a
  file for storage
- provide appropriate tests ensuring the desired outcome Document any
  assumptions and design decisions you have made.
