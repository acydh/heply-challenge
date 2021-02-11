'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts, next) {
    fastify.piscina.threads.forEach(worker => {
        worker.on('message', message => {
            const { workerId, fileName, timeLoad } = message;
            switch (message.code) {
                case 'start':           
                    // console.log(`Worker ${workerId} working on ${fileName}; Load: ${timeLoad}`);
                    fastify.status.removeFromQueue();
                    fastify.status.addToWorker(workerId, timeLoad);
                    // Add the task in the DB (bonus)
                    const newTask = fastify.taskModel.build({
                        workerId,
                        fileName,
                        timeLoad,
                    });
                    newTask.save();
                    //
                    break;
                case 'finish': 
                    // console.log(`Worker ${workerId} done working on ${fileName}`)
                    fastify.status.unloadWorker(workerId);
                    break;
                default:
                    // ignore unexpected message codes
            }
        })
    });
    next();
});
