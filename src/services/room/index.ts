import { DBSchema, openDB } from 'idb'

interface IRoomDB extends DBSchema {
    messages: {
        value: IMessage
        key: string;
        indexes: { 'createdAt': Date };
    };
}

export interface IMessage {
    messageId: string;
    createdAt: number;
    roomId: string;
    text: string;
    sender: string;
    type: string
}

export const initContractStorage = ({roomId, } : {roomId: string}) => {
    return openDB<IRoomDB>( 'room:' + roomId, 1, {
        upgrade(db) {
            const messagesStore = db.createObjectStore('messages', {
                keyPath: 'messageId',
              });

            messagesStore.createIndex('createdAt', 'createdAt', { unique: false });
            messagesStore.createIndex('roomId', 'roomId', { unique: false });
        }
    })
}

