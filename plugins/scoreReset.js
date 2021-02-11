'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
    setInterval(() => {
        if (Date.now() >= fastify.status.timeLastUpload + 60000) {
            fastify.status.generalScore = 0;
        }
    }, 1000)
});
