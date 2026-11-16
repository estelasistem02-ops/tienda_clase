import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:3000/api';
    private clave = 'token';

    login(correo: string, password: string): Observable<{ token: string }> {
    return this.http
        .post<{ token: string }>(`${this.baseUrl}/login`, { correo, password })
        .pipe(tap((respuesta) => sessionStorage.setItem(this.clave, respuesta.token)));
    }

    logout(): void {
    sessionStorage.removeItem(this.clave);
    }

    get token(): string | null {
    return sessionStorage.getItem(this.clave);
    }

    get haySesion(): boolean {
    return !!this.token;
}
}

