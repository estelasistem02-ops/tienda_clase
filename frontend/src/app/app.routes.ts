import { Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios.component';
import { LoginComponent } from './login.component';
import { ProductosComponent } from './productos.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
    { path: 'productos', component: ProductosComponent, canActivate: [authGuard]},
    { path:  'login', component:LoginComponent },
    { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
    { path: '**', redirectTo: 'usuarios' },
];
