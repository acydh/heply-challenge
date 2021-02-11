'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/viewdb', async function (request, reply) {
    const tasks = await fastify.taskModel.findAll();
    return reply.view('viewdb', { tasks });
  })
}