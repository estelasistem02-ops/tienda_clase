import {HttpClient } from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';

import {Usuario, Producto, Respuesta} from './modelos';


@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:3000/api';
    
//usuarios
listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
}

crearUsuario(usuario: Usuario): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.baseUrl}/usuarios`, usuario);
    }

actualizarUsuario(id: string, usuario: Usuario): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.baseUrl}/usuarios/${id}`, usuario);
    }


eliminarUsuario(id: string): Observable<Respuesta> {
    return this.http.delete<Respuesta>(`${this.baseUrl}/usuarios/${id}`);
    }

//productos
listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`);
    }

crearProducto(producto: Producto): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.baseUrl}/productos`, producto);
    }

actualizarProducto(id: string, producto: Producto): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.baseUrl}/productos/${id}`, producto);
    }

eliminarProducto(id: string): Observable<Respuesta> {
    return this.http.delete<Respuesta>(`${this.baseUrl}/productos/${id}`);
    }

}





