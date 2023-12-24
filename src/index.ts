import express from 'express';
import path from 'path';
import http from 'http';
import { Server, Socket } from 'socket.io';

import WorkflowOrhestrator from './services/WorkflowOrchestrator';
import { devLog } from './utils/logging';

const app = express();
const port = 5001;

const server  = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', async (req, res) => {
    res.sendFile(path.join(__dirname + '../frontend/build/index.html'));
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

io.on('connection', async (socket: Socket) => {
    devLog('Socket connection received');

    new WorkflowOrhestrator(socket);
});
