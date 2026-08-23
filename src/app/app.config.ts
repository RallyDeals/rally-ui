import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { httpRequestInterceptor } from './core/interceptors/http-request.interceptor';
import { authRefreshInterceptor } from './core/interceptors/auth-refresh.interceptor';

const RallyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{orange.50}',
      100: '{orange.100}',
      200: '{orange.200}',
      300: '{orange.300}',
      400: '{orange.400}',
      500: '{orange.500}',
      600: '{orange.600}',
      700: '{orange.700}',
      800: '{orange.800}',
      900: '{orange.900}',
      950: '{orange.950}',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({
      theme: {
        preset: RallyPreset,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
      license:
        'eyJpZCI6IjFkYWYxODE1LTJlMDgtNGQ4YS1hNjk0LWRhZTc5NzUzOTI1OCIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODc0ODY0ODEsImV4cCI6MTgxOTAyMjQ4MX0.ghF1TfHmIngFt1OO9vkcltmM6jKS_z7hEh-g2DxUQrk9R1GlriRehPwxjCVv4jorxkPkfUhQd6ggKH1jCJ5TCQ',
      ripple: true,
    }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([httpRequestInterceptor, authRefreshInterceptor])),
  ],
};
