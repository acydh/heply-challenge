'use strict';

const fp = require('fastify-plugin');
const { DataTypes } = require('sequelize');

module.exports = fp(async function (fastify, opts, next) {  
    const Task = fastify.db.define("task", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        workerId: DataTypes.INTEGER,
        fileName: DataTypes.STRING,
        timeLoad: DataTypes.INTEGER,
        
    },
    {
        updatedAt: false,
    });
    fastify.decorate("taskModel", Task);
    next();
});