// Vercel Serverless Function Entry Point inside client/
const app = require('../server/server');

module.exports = app;
module.exports.default = app;
