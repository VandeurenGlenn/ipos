import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
// import globals from 'rollup-plugin-node-globals';
export default [
	// iife , for older browsers
  {
    input: 'src/index.js',
    output: {
      file: 'index.js',
      format: 'es',
      sourcemap: false,
      // globals: ['system']
    },
    plugins: [
      builtins(),
      nodeResolve({
        jsnext: true,
        main: true
      }),
      commonjs({
        include: 'node_modules/**',  // Default: undefined,
        preferBuiltins: false
      })
    ],
    experimentalCodeSplitting: true,
    experimentalDynamicImport: true
  }
]
