import express from 'express';
import route from './routes/index';
const PORT = process.env.PORT || 5000;

const server = express();

server.listen(PORT);

export default server;
