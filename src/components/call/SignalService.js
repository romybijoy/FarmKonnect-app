let signalHandler = null;
let signalSender = null;

export const setSignalHandler = (handler) => {
  signalHandler = handler;
};

export const getSignalHandler = () => signalHandler;

export const setSignalSender = (sender) => {
  signalSender = sender;
};

export const getSignalSender = () => signalSender;
