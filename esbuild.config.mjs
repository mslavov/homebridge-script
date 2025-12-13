import * as esbuild from 'esbuild';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const SCRIPTABLE_HEADER = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
`;

// Plugin to prepend Scriptable header
const scriptableHeaderPlugin = {
  name: 'scriptable-header',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length === 0) {
        const outfile = build.initialOptions.outfile;
        if (outfile && fs.existsSync(outfile)) {
          const content = fs.readFileSync(outfile, 'utf8');
          fs.writeFileSync(outfile, SCRIPTABLE_HEADER + content);
          console.log('Added Scriptable header to output');
        }
      }
    });
  },
};

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'iife',
  target: 'es2020',
  platform: 'neutral',
  define: {
    'process.env.HB_URL': JSON.stringify(process.env.HB_URL || 'http://localhost:8581'),
    'process.env.HB_USERNAME': JSON.stringify(process.env.HB_USERNAME || ''),
    'process.env.HB_PASSWORD': JSON.stringify(process.env.HB_PASSWORD || ''),
  },
  plugins: [scriptableHeaderPlugin],
  minify: false,
  keepNames: true,
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete: dist/index.js');
}
