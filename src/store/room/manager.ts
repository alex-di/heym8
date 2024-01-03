
import { Caller } from "../../services";


export const initCaller = (username, connection) => {

  const caller = new Caller({
    username,
    roomId: location.hash,
    connection,
  });

  return Promise.resolve(caller)
}