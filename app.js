'use strict'

const path = require('path');

const fastify = require('fastify')({ logger: false });
const AutoLoad = require('fastify-autoload');

fastify.register(require('fastify-multipart'));

fastify.register(require('fastify-rate-limit'), {
  max: 10,
  timeWindow: '1 minute'
})

fastify.register(require('sequelize-fastify'), {
  instance: 'db',
  sequelizeOptions: {
      database: 'data',
      dialect: 'sqlite',
      storage: './data.sqlite',
  }
});

fastify.register(require('fastify-piscina'), {
  filename: path.resolve(__dirname, 'worker.js'),
  concurrentTasksPerWorker: 1, // It's the default. Showing just to reflect requirements
  minThreads: 3, // All threads are up and ready to accept new files from the start
  maxThreads: 3,
});

fastify.register(require('point-of-view'), {
  engine: {
    pug: require('pug')
  },
  root: path.join(__dirname, 'views'),
  viewExt: 'pug',
});

// Load custom plugins and routes

fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'plugins'),
});

fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'routes'),
});

fastify.listen(process.env.PORT || 3000, '0.0.0.0', (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.db.sync({ force: true }); // set to TRUE for a DB reset on server start
  fastify.log.info(`server listening on ${address}`);
});