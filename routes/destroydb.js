'use strict'

// Just for testing purposes, visiting this route triggers a reset of the tasks table in the db

module.exports = async function (fastify, opts) {
  fastify.get('/destroydb', async function (request, reply) {
    fastify.taskModel
      .destroy({ where:{} }, { truncate: true })
      .then(() => {
        return reply.redirect("/viewdb");
      })
      .catch(err => {
          console.error(err);
      })
  })
}