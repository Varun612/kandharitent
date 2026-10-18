// Vercel Serverless Function Entry Point
// Bridges incoming HTTP requests to the Kandhari Tent & Caterers Express backend
const app = require('../server/server');

module.exports = app;
module.exports.default = app;
