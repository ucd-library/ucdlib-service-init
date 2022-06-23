import {exec} from "child_process";

export default (cmd, opts={}) => {
  if( !opts.shell ) args.shell = '/bin/bash';

  return new Promise((resolve, reject) => {
    exec(cmd, opts, (error, stdout, stderr) => {
      if( error ) reject(error);
      else resolve({stdout, stderr});
    });
  });
}