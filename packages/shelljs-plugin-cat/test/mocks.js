export let stdout = '';
export let stderr = '';

export const consoleLog = (...msgs) => {      // mock console.log
  stdout += `${msgs.join(' ')}\n`;
};

export const consoleError = (...msgs) => {    // mock console.error
  stderr += `${msgs.join(' ')}\n`;
};

export const stdoutWrite = (msg) => {         // mock process.stdout.write
  stdout += msg;
  return true;
};

export const processExit = (retCode) => {     // mock process.exit
  const e = {
    msg: 'process.exit was called',
    code: retCode || 0,
  };
  throw e;
};

export const getStdout = () => stdout;
export const getStderr = () => stderr;

export const resetValues = () => {
  stdout = '';
  stderr = '';
};
