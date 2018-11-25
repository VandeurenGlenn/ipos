import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default [
	// iife , for older browsers
  {
    input: 'src/index.js',
    output: {
      file: 'distro-builder.js',
      format: 'cjs',
      sourcemap: false
    },
    experimentalCodeSplitting: true,
    experimentalDynamicImport: true
  }
]
