import mysql from 'mysql2/promise';
import config from './config.js';
import {connect, Schema, model} from 'mongoose';
import fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_PASS = process.env.MONGO_PASS;

const server = fastify({ logger: true });

