'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
    const { SECONDS_TO_SCORE_RESET } = fastify.constants;
    setInterval(() => {
        if (Date.now() >= fastify.status.timeLastUpload + SECONDS_TO_SCORE_RESET) {
            fastify.status.generalScore = 0;
        }
    }, 1000)
});
