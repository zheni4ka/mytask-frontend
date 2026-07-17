import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  SOCIAL_AUTH_CONFIG,
} from '@abacritt/angularx-social-login';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleAPIkey, {
              scopes: 'profile email https://www.googleapis.com/auth/calendar.events',
              prompt: ''
            }),
          },
        ]
      } as SocialAuthServiceConfig,
    },
  ],
};
