import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { appConfig } from './app.config';

export const config = mergeApplicationConfig(appConfig, {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
});
