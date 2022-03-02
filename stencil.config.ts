import { Config } from '@stencil/core';
import { sass } from "@stencil/sass";

export const config: Config = {
  namespace: 'dopevr-core',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      dir: 'www',
      baseUrl: '/',
      buildDir: 'vr_build',
      indexHtml: 'index.html',
      empty: true,
      serviceWorker: null, // disable service workers
    }
  ],
  plugins: [
    sass()
  ]
};
