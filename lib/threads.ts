import path from "path";
import { cpus, tmpdir } from "os";
import { Worker, isMainThread, parentPort } from "worker_threads";

import esbuild from "esbuild";

function getCallerFile() {
  const originalPrepareStackTrace = Error.prepareStackTrace;

  // Temporarily override stack trace generation
  Error.prepareStackTrace = (_, stack) => stack;

  const error = new Error();
  const stack = error.stack;

  // Restore the original stack trace behavior
  Error.prepareStackTrace = originalPrepareStackTrace;

  if (stack && stack.length > 2) {
    // Stack[0] is this function, stack[1] is the caller of this function, stack[2] is the caller of the caller
    const caller = stack[2];
    return caller.getFileName();
  }

  return null; // Caller file not found
}

export type ThreadOpts = {
  n?: number;
};

type ThreadsResultBase = {
  isMain: boolean;
};

type ThreadsResultMain = ThreadsResultBase & {
  isMain: true;
  start: () => void;
};

type ThreadsResultWorker = ThreadsResultBase & {
  isMain: false;
};

export type ThreadsResult = ThreadsResultMain | ThreadsResultWorker;

type ThreadMessageBase = {
  id: number;
};

export function threads(opts: ThreadOpts = {}): ThreadsResult {
  const { n = cpus().length } = opts;

  console.log(Error.prepareStackTrace);
  const srcPath = getCallerFile();
  const outfile = `/.${srcPath}.bundle.js`;
  console.log("threads", srcPath, outfile);

  if (isMainThread) {
    console.log("Main thread");

    function start() {
      esbuild.buildSync({
        entryPoints: [srcPath],
        bundle: true,
        platform: "node",
        format: "esm",
        external: ["esbuild"],
        outfile,
      });

      const worker = new Worker(outfile, {});
      worker.on("message", (msg) => {
        console.log("main received", msg);
      });
      // vefify that the worker is working
      worker.postMessage("Hello from main thread");
    }

    return { isMain: true, start };
  } else {
    console.log("Worker thread");
    parentPort?.on("message", (message) => {
      console.log("Message from main thread:", message);
      parentPort?.postMessage("Hello from worker thread");
    });

    return { isMain: false };
  }
}
