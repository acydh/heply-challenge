'use strict'

const fs = require('fs')
const util = require('util')
const { pipeline } = require('stream')
const pump = util.promisify(pipeline)

module.exports = async (fastify, opts) => {
  fastify.post('/elaborate', {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: '1 minute'
        }
      }
    },
    async function (req, reply) {
      const { MAX_FILE_SIZE } = fastify.constants;
      const response = {
        uploaded: [],
        rejected: [],
      };
      try {
        const options = {
          limits: { fileSize: MAX_FILE_SIZE }
        };
        const parts = await req.files(options);
        for await (const part of parts) {
          const filePath = `tmp/${part.filename}.${Date.now()}`; // Create an unique filename to prevent duplicates
          await pump(part.file, fs.createWriteStream(filePath));
          fastify.status.timeLastUpload = Date.now();
          const fileSize = fs.statSync(filePath).size;
          if (part.file.truncated) {
            fs.unlinkSync(filePath);
            const rejectedFileDetails = {
              filename: part.filename,
              fileSize,
              reason: `File size too big`
            }
            response.rejected.push(rejectedFileDetails);
          } else {
            const uploadedFileDetails = {
              filename: part.filename,
              fileSize
            }
            // Following requirements, check if all workers are busy. If so, add the MINIMUM wait time in seconds for the next worker to be available to the response 
            const minWaitTime = getMinWaitTime();
            if (minWaitTime > 0) {
              uploadedFileDetails.minWaitTime = minWaitTime
            }
            fastify.runTask(filePath);
            fastify.status.addToQueue(fileSize);
            response.uploaded.push(uploadedFileDetails);
          }
        }
      } catch (error) {
        // Prevent too verbose errors to be sent to the client. Ideally the max file size will be limited by the frontend.
      }
      reply.send(response);
    })

  function getMinWaitTime() {
    const workersData = Object.values(Object.fromEntries(fastify.status.workers));
    if (workersData.every(worker => worker.onElaboration)) {
      const endTimes = workersData
        .map(values => {
          const elapsedTime = Date.now() - values.initiatedAt;
          const remainingTime = values.timeLoad - elapsedTime;
          return Math.ceil(remainingTime) / 1000
        });
      return (Math.min(...endTimes));
    } else {
      return (0)
    }
  }

}