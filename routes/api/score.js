'use strict'

module.exports = async (fastify, opts) => {
  fastify.get('/score', async function (req, reply) {
    const { workers, generalScore } = fastify.status;
    const response = {
        workers: [],
    };
    for (let [workerId, data] of workers) {
        if (data.onElaboration) {
          const elapsedTime = Date.now() - data.initiatedAt;
          const remainingTime = data.timeLoad - elapsedTime;
          response.workers.push({
            workerId,
            isElaboraring: true,
            remainingTime: Math.floor(remainingTime / 1000)
          })
        } else {
          response.workers.push({
            workerId,
            isElaborating: false,
          })
        }  
    };
    response.generalScore = Math.floor(generalScore / 1000);
    reply.send(response);
  })
}
