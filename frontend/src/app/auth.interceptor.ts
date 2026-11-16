import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";

import { AuthService } from "./auth.service";

export const authInterceptor: HttpInterceptorFn = ( req, next) => {
    const token = inject(AuthService).token;

    // si hay token, se clona la petici[on y se agrega el encabezado
    if (token){
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(req);
};