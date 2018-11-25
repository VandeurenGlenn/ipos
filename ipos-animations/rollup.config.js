export default [
	// iife , for older browsers
  {
    input: 'src/index.js',
    output: {
      file: 'index.js',
      format: 'cjs',
      sourcemap: false
    },
    // external: ['backed', 'custom-renderer-mixin'],
    experimentalCodeSplitting: true,
    experimentalDynamicImport: true
  }
]
