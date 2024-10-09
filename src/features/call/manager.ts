import { Caller } from "../../entities/caller";


export const initCaller = (username, connection) => {

  const caller = new Caller({
    username,
    roomId: location.hash,
    connection,
  });

  return Promise.resolve(caller)
}