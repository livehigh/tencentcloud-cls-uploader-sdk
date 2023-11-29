import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default [
  {
    input: 'src/index.ts',
    output: {
      format: 'umd',
      file: 'dist/cls.cjs',
      name: 'ClsClient',
    },
    external: ['axios', 'crypto-js'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      json(),
      resolve(),
      commonjs(),
    ],
    onwarn: (msg, warn) => {
      if (/Circular dependency/.test(msg)) return;
      warn(msg);
    },
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'umd',
      file: 'dist/cls.browser.js',
      name: 'ClsClient',
    },
    external: [],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      json(),
      resolve({
        preferBuiltins: true, //这一句是重点
        mainFields: ['browser'],
      }),
      commonjs(),
    ],
    onwarn: (msg, warn) => {
      if (/Circular dependency/.test(msg)) return;
      warn(msg);
    },
  },
];
