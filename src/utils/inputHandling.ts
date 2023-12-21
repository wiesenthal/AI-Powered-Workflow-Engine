import { Socket } from "socket.io";

type setInputFnType = (key: string, value: string) => void;

export const handleInputUpdates = (socket: Socket, setInputValue: setInputFnType) => {
    socket.on('setInputVariable', (key: string, value: string) => {
        console.log(`Received input update for key ${key} with value ${value}`);
        setInputValue(key, value);
    });
}