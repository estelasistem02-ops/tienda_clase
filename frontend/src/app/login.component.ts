import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    private auth = inject(AuthService);
    private router = inject(Router);

    correo = '';
    password = '';
    error = signal('');
    cargando = signal(false);

    entrar(): void {
    if (this.cargando()) return;

    this.cargando.set(true);
    this.error.set('');

    this.auth.login(this.correo.trim(), this.password).subscribe({
        next: () => {
        this.cargando.set(false);
        this.router.navigate(['/usuarios']);
    },
        error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(error.error?.mensaje ?? 'No fue posible comunicarse con la API.');
    },
    });
}
}
