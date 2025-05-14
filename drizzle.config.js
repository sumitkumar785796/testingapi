const { dburl } = require("./utils");
const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  out: './drizzle',
  schema: './models/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: dburl,
  },
});
