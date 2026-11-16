import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

  // Si hay sesión, deja pasar. Si no, manda al login.
    return auth.haySesion ? true : router.createUrlTree(['/login']);
};