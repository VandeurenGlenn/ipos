import { join } from './path.js';
const systemDrive = () => {
  try {
    return process.systemDrive;
  } catch (e) {
    return '/'
  }
}
const root = systemDrive();
const os = join(`${root}, IPOS`);
const system = join(`${os}, system`);
const user = join(`${os}, user`);
const programs = join(`${user}, programs`);
const packages = join(`${user}, packages`);

const paths = {
  root,
  os,
  system,
  user,
  programs,
  packages
}

console.log(paths);
if (window !== undefined) {
  window.paths = window.paths || paths;
}

export default paths;
