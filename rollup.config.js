
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default [
  {
    input: './src/index.js',
    output: [
      {
        file: './lib/css-animation-blocks.js',
        format: 'cjs',
      },
      {
        file: './lib/css-animation-blocks.esm.js',
        format: 'esm',
      }
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
    ]
  },
  {
    input: './src/index.js',
    output: [
      {
        file: './lib/css-animation-blocks.min.js',
        format: 'iife',
        name: 'AnimationBlock'
      }
    ],
    plugins: [
        babel({
          exclude: 'node_modules/**'
        }),
        uglify()
    ]
  }
]
