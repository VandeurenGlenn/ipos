'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var util = require('util');
var child_process = require('child_process');
var chalk = require('chalk');
var rollup = require('rollup');
var del = _interopDefault(require('del'));
require('sharp');

const read = util.promisify(fs.readFile);
const write = util.promisify(fs.writeFile);
const move = util.promisify(fs.rename);
const mkdir = util.promisify(fs.mkdir);
const packageSources = ['ipos-system', 'ipos-animations', 'ipos-desktop', 'ipos-launcher'];
const programSources = ['ipos-calculator', 'ipos-vibes', 'ipos-discoverer', 'ipos-plexweb'];
const bootSources = ['ipos'];

const sources = [...packageSources, ... programSources];

const dependenciesMap = new Map();
const sourcesMap = new Map();

let skipInstall, skipClean;

process.argv.forEach(arg => {
  if (arg === '--skip-install' || arg === 'si') skipInstall = true;
  if (arg === '--skip-clean' || arg === 'sc') skipClean = true;
});

const hasRollup = async source => {
  try {
    await read(`${source}/rollup.config.js`);
    return true;
  } catch (e) {
    return false;
  }
};

const config = async source => {
  let buildFile = null;
  let makeFile = null;
  let rollup$$1 = 'rollup -c';
  // const npmPackage = await read(`${source}/package.json`); // not sure if we are going to keep
  try {
    makeFile = await read(`${source}/makeFile`); // unix support
    makeFile = makeFile.toString();
  } catch (e) {
    try {
      buildFile = await read(`${source}/build.json`); // ipos targeted app
      buildFile = JSON.parse(buildFile.toString());
      rollup$$1 = await hasRollup(source);
    } catch (e) {
      rollup$$1 = await hasRollup(source);
      console.warn(chalk.yellow(`no build.json or makeFile found for ${source}`));
    }
  }
  return {makeFile, buildFile, rollup: rollup$$1 ? 'rollup -c' : null};
};

const ensureArray = input => {
  if (Array.isArray(input)) return input;
  if (typeof input === 'object') return Object.keys(key).map(input[key]);
  return [input];
};

const promiseSystem = () => new Promise((resolve, reject) => {
  let count = 0;
  sources.forEach(async source => {

    const {makeFile, buildFile, rollup: rollup$$1} = await config(source);
    if (makeFile) {
      reject('Not supported yet');
      return;
    }
    count++;
    // if (rollup) rolls.push(source);

    if (buildFile) {
      sourcesMap.set(source, {
        src: ensureArray(buildFile.entry),
        name: buildFile.name
      });
      // add to dependenciesMap to check for shared deps
      dependenciesMap.set(source, {
        dependencies: buildFile.dependencies,
        name: buildFile.name
      });
    }
    if (count === sources.length) {
      return resolve();
      // console.log('start bundling');
    }
  });
});

const promiseRollup = (sources, format = 'es') => new Promise(async (resolve, reject) => {
  let count = 0;
  sources.forEach(async source => {
    try {
      const bundle = await rollup.rollup({
        input: `${source}/src/index.js`,
        onwarn: warn => console.warn(warn)
      });
      await bundle.write({ format: format, file: `${source}/${source}.js` });
      count++;
      if (count === sources.length) resolve();
    } catch (e) {
      console.error(e);
    } finally {

    }
  });
});

const bundleSystem = () => new Promise(async (resolve, reject) => {
  try {
    await promiseRollup(sources);
    await promiseRollup(bootSources, 'cjs');
    const input = [
      ...sources.map(source => `${source}/${source}.js`),
      ...bootSources.map(source => `${source}/${source}.js`)
    ];
    // rolls.forEach(async source => {
    const bundle = await rollup.rollup({
      input,
      onwarn: warn => console.warn(warn),
      experimentalCodeSplitting: true
    });
    console.log(bundle);
    await bundle.write({ format: 'es', dir: 'out',
    experimentalDynamicImport: true });
    resolve();
  } catch (e) {
    console.error(e);
  } finally {

  }
    // console.log();
    // await runRollup(source);
    // count++;
    // if (count === rolls.length) resolve();
  // });
});

const copySystem = () => new Promise(async (resolve, reject) => {
  if (!skipClean) {
    await mkdir('out/packages');
    await mkdir('out/programs');
    await mkdir('out/system');
    await mkdir('out/boot');
  }
  const packages = packageSources.map(source => [`out/${source}.js`, `out/packages/${source}.js`]);
  const programs = programSources.map(source => [`out/${source}.js`, `out/programs/${source}.js`]);
  const boot = bootSources.map(source => {
    if (source === 'ipos') {
      return [`out/${source}.js`, `out/boot/index.js`];
    }
    return [`out/${source}.js`, `out/boot/${source}.js`];
  });
  const sources = [...packages, ...programs, ...boot];

  let count = 0;
  console.log(chalk.cyan('\ncopying system'));
  sources.forEach(async source => {
    try {
      await move(source[0], source[1]);

      console.log(`${source[0]} => ${source[1]}`);
      count++;
      if (count === sources.length) resolve();
    } catch (e) {
      reject(e);
    }
  });
});

const copyBoot = () => new Promise((resolve, reject) => {
  const boot = [
    [`ipos/index.html`, `out/boot/index.html`],
    ['ipos/package.json', 'out/boot/package.json']
  ];

  let count = 0;
  console.log(chalk.cyan('\ncopying boot'));
  boot.forEach(async source => {
    try {
      const data = await read(source[0]);
      await write(source[1], data);
      console.log(`${source[0]} => ${source[1]}`);
      count++;
      if (count === boot.length) resolve();
    } catch (e) {
      reject(e);
    }
  });
});

const installDependencies = () => new Promise((resolve, reject) => {
  console.log(chalk.cyan('\ninstalling dependencies'));
  child_process.exec('yarn install', {cwd: 'out/boot'}, (error, stdout, stderr) => {
    if (error) {
      reject(`exec error: ${error}`);
      return;
    }
    resolve();
  });
});

const prepareBuild = async () => {
  const build = await read('ipos/build.json', 'utf8');
  if (!skipClean) await del('out');
  return JSON.parse(build).version;
};

const iconBuffer = source => read(`${source}/icon.png`, 'base64');

const createProgramIndex = async () => {
  const readIndex = new Promise((resolve, reject) => {
  // map programs by "path", "type", "icon"
    const index = [];
    let count = 0;
    programSources.forEach(async source => {
      const icon = await iconBuffer(source);
      index.push([`programs/${source}.js`, `data:image/png;base64,${icon}`]);
      count++;
      if (count === programSources.length) resolve(index);
    });
  });
  const index = await readIndex;
  await write('out/system/program.index', JSON.stringify(index));
};

(async () => {
  console.log(chalk.cyan('Initializing build'));
  const version = await prepareBuild();
  console.log(chalk.cyan(`Building ipos ${version}`));
  await promiseSystem();
  await bundleSystem();
  await copySystem();
  await createProgramIndex();
  await copyBoot();
  if (!skipInstall) await installDependencies();

  console.log(chalk.green('\nfinished without errors'));
})();
