import connection from './../node_modules/socket-request-client/src/index.js';
let client;

const request = async (url, params) => {
  client = client || await connection(5005)
  if (typeof params !== 'object') throw 'Expected params to be typeof object';
  if (url === 'writeLocal' && !params.path) throw 'Expected path to be defined';
  if (url === 'write' && !params.cid) throw 'Expected CID to be defined';
  const response = await client.request({url, params});
  console.log('url:', url,'\nresponse:', response);
  if (!response.writable && !response.readable) return atob(response);
  else return response;

};

export default (() => {
  return {
    readLocal: async path => await request('readLocal', {path}),
    writeLocal: async file => await request('writeLocal', file),
    read: async cid => await request('read', cid),
    write: async object => await request('write', object),
    play: async path => await request('play', {path}),
    pause: async path => await request('pause', {path}),
    resume: async path => await request('resume', {path}),
    stream: async src => await request('stream', {src}),
    drives: async () => await request('drives', {}),
    programs: async () => await request('programs', {}),
  }
})()
