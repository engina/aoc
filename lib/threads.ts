import { cpus } from "os";
import {
  Worker,
  isMainThread,
  parentPort,
  threadId,
  workerData,
} from "worker_threads";
import debug from "debug";
process.env.DEBUG_COLORS ??= "true";
const log = debug(`threads[${threadId}]`);

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

export async function init(
  n: number = cpus().length,
  srcPath: string = getCallerFile()
) {
  log("init", n, srcPath);
  if (!isMainThread) {
    // log("not main thread");
    return false;
  }
  // const stat = await fs.statSync(srcPath);
  const compStart = performance.now();
  const esb = await esbuild.build({
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
  console.log("compiled inn", compElapsed, n, srcPath);

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
  log(`created ${workers.length} threads`);
  return true;
}

if (isMainThread) process.on("exit", cleanup);

export function cleanup() {
  log("cleaning up");
  workers.forEach((w) => w.terminate());
}

const cache: Record<string, string> = {};
export async function threads<T, R>(
  args: T[],
  fn: (a: T) => R,
  opts: ThreadOpts = {}
): Promise<R[]> {
  let outfile = "";
  if (isMainThread) {
    const srcPath = getCallerFile();
    log(`Compiling ${srcPath}`);
    if (cache[srcPath]) {
      outfile = cache[srcPath];
    } else {
      const esb = await esbuild.build({
        entryPoints: [srcPath],
        bundle: true,
        platform: "node",
        format: "cjs",
        external: ["esbuild"],
        write: false,
        sourcemap: true,
        logLevel: "debug",
        minify: true,
      });
      outfile = esb.outputFiles[0].text;
      cache[srcPath] = outfile;
    }
    log("Compilation completed");
  }

  return new Promise((resolve, reject) => {
    const { n = cpus().length } = opts;

    const results: R[] = Array(args.length).fill(null);

    // console.log("threads", srcPath, outfile);

    if (isMainThread) {
      log("Main thread");

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
          log("completed", completed, n);
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
        log("Worker thread completed in", elapsed, message.args.length);
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

export async function threads2<T, R>(
  args: T[],
  fn: (a: T) => R,
  opts: ThreadOpts = {}
): Promise<R[]> {
  const srcPath = getCallerFile();
  const compStart = performance.now();
  const esb = await esbuild.buildSync({
    entryPoints: [srcPath],
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["esbuild"],
    write: false,
    sourcemap: true,
    logLevel: "debug",
    minify: true,
  });
  const compElapsed = performance.now() - compStart;
  const outfile = esb.outputFiles[0].text;
  console.log("compiled in", compElapsed);

  return new Promise((resolve, reject) => {
    const { n = cpus().length } = opts;

    const results: R[] = Array(args.length).fill(null);

    // console.log("threads", srcPath, outfile);

    if (isMainThread) {
      console.log("Main thread");

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
        log("Worker thread completed in", elapsed, message.args.length);
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

export async function shread<T, R>(args: T[], fn: (a: T) => R): Promise<R[]> {
  if (isMainThread) {
    // send requests
  } else {
    // install handler
  }
  return [];
}
