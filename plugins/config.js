'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
    fastify.decorate("constants", {
        SECONDS_TO_SCORE_RESET: 60000,
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB file limit
    });
});
