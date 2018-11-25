
export const join = paths => {
  let count = 0;
  paths = paths.replace('/', ', ').split(', ');
  console.log(paths);
  return paths.reduce((p, c) => {
    if (c.length > 0) {
      return p += `/${c}`;
    } else {
      return p;
    }

  }, '');
}

const path = {
  join
}

if (window !== undefined) {
  window.path = window.path || path;
}

export default path;
