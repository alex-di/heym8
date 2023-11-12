
import { Caller } from "../../services";


export const initCaller = (username) => {

  const caller = new Caller({
    username,
    roomId: location.hash,
  });

  return Promise.resolve(caller)
}