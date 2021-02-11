'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts, next) {  

  fastify.decorate('status', {
    
    generalScore: 0,
    timeLastUpload: 0,
    workers: populateWorkers(),
    queue: [],

    addToWorker: function(workerId, timeLoad) {
      this.workers.set(workerId, { 
        onElaboration: true,
        timeLoad,
        initiatedAt: Date.now() 
      })
    },

    unloadWorker: function(workerId) {
      this.generalScore += this.workers.get(workerId).timeLoad; 
      this.workers.set(workerId, {
        onElaboration: false,
        timeLoad: 0,
        initiatedAt: 0
      });
    },

    addToQueue: function(fileSize) {
      const timeLoad = Math.floor(fileSize / 1024); // ~ 1 s/MB, expressed in milliseconds
      this.queue.push(timeLoad);
    },

    removeFromQueue: function() {
      this.queue.pop();
    }

  });

  function populateWorkers() {
    const workers = new Map();
    fastify.piscina.threads.forEach(worker => {
      workers.set(worker.threadId, { 
        onElaboration: false,
        timeLoad: 0,
        initiatedAt: 0, 
      })
    })
    return workers;
  }

  next();
});
