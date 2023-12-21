import express from 'express';
import path from 'path';
import workflowExecutor from './services/WorkflowExecutor';
import { loadWorkflow } from './utils/fileUtils';
import http from 'http';
import { Server, Socket } from 'socket.io';

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
    console.log('Socket connection received');

    socket.on('executeWorkflow', async (workflowName: string, callback: Function) => {
        console.log(`Executing workflow ${workflowName}`);
        const workflow = loadWorkflow(workflowName);
        console.log(`Workflow loaded: ${JSON.stringify(workflow)}`)
        const output = await workflowExecutor.executeWorkflow(workflow);
        callback(output);
    });
});