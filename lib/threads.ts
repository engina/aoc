import path from "path";
import { cpus, tmpdir } from "os";
import {
  Worker,
  isMainThread,
  parentPort,
  threadId,
  workerData,
} from "worker_threads";
import debug from "debug";

const log = debug("threads");

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
  sharedArrayBuffer?: SharedArrayBuffer;
};

type ThreadsResultBase = {
  isMain: boolean;
};

type ThreadsResultMain = ThreadsResultBase & {
  isMain: true;
};

type ThreadsResultWorker = ThreadsResultBase & {
  isMain: false;
};

export type ThreadsResult = ThreadsResultMain | ThreadsResultWorker;

type ThreadMessageBase = {
  start: number;
  len: number;
};

type ThreadMessageRequest<T> = ThreadMessageBase & {
  args: T[];
};

type ThreadMessageResponse<R> = ThreadMessageBase & {
  results: R[];
};

const workers: Worker[] = [];

export function init(srcPath: string, n: number) {
  if (isMainThread) {
    console.log("Main thread");
    const compStart = performance.now();
    const esb = esbuild.buildSync({
      entryPoints: [srcPath],
      bundle: true,
      platform: "node",
      format: "cjs",
      external: ["esbuild"],
      write: false,
      logLevel: "debug",
      minify: true,
    });
    const compElapsed = performance.now() - compStart;
    const outfile = esb.outputFiles[0].text;
    console.log("compiled in", compElapsed);

    log("Creating", n, "worker threads");
    for (let i = 0; i < n; i++) {
      // console.log("Creating worker thread", i);
      const worker = new Worker(outfile, {
        eval: true,
      });
      worker.on("message", (msg: ThreadMessageResponse<R>) => {
        // console.log("Message from worker thread:".red, msg);
        // for (let j = msg.start; j < msg.start + msg.len; j++) {
        //   results[j] = msg.results[j - msg.start];
        // }
        // completed += 1;
        // if (completed === n) {
        //   log("all responses received");
        //   resolve(results);
        //   workers.forEach((w) => w.terminate());
        // }
      });
      workers.push(worker);
      // const request = {
      //   start: i * batchSize,
      //   len: Math.max(Math.min(batchSize, args.length - i * batchSize), 0),
      //   args: args.slice(i * batchSize, (i + 1) * batchSize),
      // } as ThreadMessageRequest<T>;
      // worker.postMessage(request);
    }
    log(`created ${workers.length} threads and sent requests`);
  }
}

export function cleanup() {
  workers.forEach((w) => w.terminate());
}

export async function threads<T, R>(
  args: T[],
  fn: (a: T) => R,
  opts: ThreadOpts = {}
): Promise<R[]> {
  const srcPath = getCallerFile();
  // const outfile = `/.${srcPath}.bundle.js`;
  return new Promise((resolve, reject) => {
    const { n = cpus().length } = opts;

    const results: R[] = Array(args.length).fill(null);

    // console.log("threads", srcPath, outfile);

    if (isMainThread) {
      console.log("Main thread");
      const compStart = performance.now();
      const esb = esbuild.buildSync({
        entryPoints: [srcPath],
        bundle: true,
        platform: "node",
        format: "cjs",
        external: ["esbuild"],
        write: false,
        logLevel: "debug",
        minify: true,
      });
      const compElapsed = performance.now() - compStart;
      const outfile = esb.outputFiles[0].text;
      console.log("compiled in", compElapsed);

      const workers: Worker[] = [];
      const batchSize = Math.ceil(args.length / n);

      let completed = 0;
      log("Creating", n, "worker threads");
      for (let i = 0; i < n; i++) {
        // console.log("Creating worker thread", i);
        const worker = new Worker(outfile, {
          eval: true,
        });
        worker.on("message", (msg: ThreadMessageResponse<R>) => {
          // console.log("Message from worker thread:".red, msg);
          for (let j = msg.start; j < msg.start + msg.len; j++) {
            results[j] = msg.results[j - msg.start];
          }
          completed += 1;
          if (completed === n) {
            log("all responses received");
            resolve(results);
            workers.forEach((w) => w.terminate());
          }
        });
        workers.push(worker);
        const request = {
          start: i * batchSize,
          len: Math.max(Math.min(batchSize, args.length - i * batchSize), 0),
          args: args.slice(i * batchSize, (i + 1) * batchSize),
        } as ThreadMessageRequest<T>;
        worker.postMessage(request);
      }
      log("created threads and sent requests");
    } else {
      // const { sharedArrayBuffer } = workerData as {
      //   sharedArrayBuffer?: SharedArrayBuffer;
      // };
      log("Worker thread");
      parentPort?.on("message", (message: ThreadMessageRequest<T>) => {
        log("Message from main thread");
        const started = performance.now();
        const result = Array(message.args.length);
        for (let i = 0; i < message.args.length; i++) {
          result[i] = fn(message.args[i]);
        }
        const elapsed = performance.now() - started;
        console.log("Worker thread completed in", elapsed, message.args.length);
        log("responding with", threadId);
        parentPort?.postMessage({
          start: message.start,
          len: message.len,
          results: result,
        });
      });
    }
  });
}
