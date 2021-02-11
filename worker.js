'use strict'

const fs = require('fs');
const { promisify } = require('util')
const sleep = promisify(setTimeout)
const { parentPort, threadId } = require('worker_threads');

module.exports = async function(filePath) {
    const workerId = threadId; // name change for consistency purposes
    const fileSize = fs.statSync(filePath).size; 
    const fileName = filePath.split("/").pop();
    const timeLoad = Math.floor(fileSize / 1024); // ~ 1 s/MB, expressed in milliseconds
    parentPort.postMessage({
        code: 'start',
        workerId,
        fileName, 
        timeLoad,
        ready: true
    });
    await sleep(timeLoad); // to fake an elaboration
    parentPort.postMessage({
        code: "finish",
        workerId,
        fileName, 
        ready: true
    });    
    // Delete the file after elaboration
    try {
        fs.unlinkSync(filePath)
    } catch(error) {
        console.error(error)
    }
};