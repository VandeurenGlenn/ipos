const child_process = require('child_process');
const { promisify } = require('util');

const exec = promisify(child_process.exec);
const projects = ['ipos-system', 'ipos']

const paths = projects.map(project => {
  return `../${project}`;
});

paths.forEach(async path => {
  try {
    const build = await exec('npm run "build"', {cwd: path});
    console.log(build.stderr.toString());
  } catch (e) {
    console.error(e);
  } finally {
    console.log('done');
  }
})
