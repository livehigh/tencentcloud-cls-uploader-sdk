import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const extensions = ['.js', '.ts'];

export default [
  {
    input: 'src/index.ts',
    output: {
      format: 'umd',
      file: 'dist/cls.cjs.js',
      name: 'ClsClient',
    },
    external: ['axios', 'crypto-js'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: ['node_modules/**', 'src/proto/cls.js'],
        extensions,
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
      format: 'esm',
      file: 'dist/cls.mjs.js',
      name: 'ClsClient',
    },
    external: ['axios', 'crypto-js'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: ['node_modules/**', 'src/proto/cls.js'],
        extensions,
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
      file: 'dist/cls.js',
      name: 'ClsClient',
    },
    external: [],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: ['node_modules/**', 'src/proto/cls.js'],
        extensions,
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
  {
    input: 'src/index.ts',
    output: {
      format: 'umd',
      file: 'dist/cls.min.js',
      name: 'ClsClient',
    },
    external: [],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
      babel({
        exclude: ['node_modules/**', 'src/proto/cls.js'],
        extensions,
      }),
      json(),
      resolve({
        preferBuiltins: true, //这一句是重点
        mainFields: ['browser'],
      }),
      commonjs(),
      terser(),
    ],
    onwarn: (msg, warn) => {
      if (/Circular dependency/.test(msg)) return;
      warn(msg);
    },
  },
];
