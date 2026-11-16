import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiService } from './api.service';
import { Usuario } from './modelos';

@Component({
  selector: 'app-usuarios',
  standalone: true,

  // FormsModule permite utilizar [(ngModel)] en el formulario.
  imports: [FormsModule],

  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  private api = inject(ApiService);

  // Las señales notifican a Angular cuando cambia la información.
  usuarios = signal<Usuario[]>([]);
  mensaje = signal('');
  guardando = signal(false);

  // Si contiene un identificador, estamos editando.
  // Si contiene null, estamos creando.
  idEdicion: string | null = null;

  formulario: Usuario = {
    nombre: '',
    correo: '',
    password: '',
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.listarUsuarios().subscribe({
      next: (datos) => this.usuarios.set(datos),
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  guardar(): void {
    if (this.guardando()) return;

    this.guardando.set(true);
    this.mensaje.set('');

    // Enviamos únicamente los campos editables.
    const datos: Usuario = {
      nombre: this.formulario.nombre,
      correo: this.formulario.correo,
      password: this.formulario.password,
    };

    if (this.idEdicion) {
      this.api.actualizarUsuario(this.idEdicion, datos).subscribe({
        next: () => this.finalizarGuardado('Usuario actualizado.'),
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);
          this.mostrarError(error);
        },
      });
    } else {
      this.api.crearUsuario(datos).subscribe({
        next: () => this.finalizarGuardado('Usuario creado.'),
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);
          this.mostrarError(error);
        },
      });
    }
  }

  editar(usuario: Usuario): void {
    if (!usuario._id) return;

    this.idEdicion = usuario._id;

    /*
     * Copiamos los datos.
     * Así, escribir en el formulario no modifica directamente la tabla.
     */
    this.formulario = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: usuario.password,
    };

    this.mensaje.set('');
  }

  eliminar(usuario: Usuario): void {
    if (!usuario._id) return;

    if (!confirm(`¿Eliminar a ${usuario.nombre}?`)) return;

    this.api.eliminarUsuario(usuario._id).subscribe({
      next: () => {
        // Si eliminamos el registro en edición, limpiamos el formulario.
        if (this.idEdicion === usuario._id) {
          this.cancelar();
        }

        this.mensaje.set('Usuario eliminado.');
        this.cargar();
      },
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  cancelar(): void {
    this.idEdicion = null;
    this.formulario = { nombre: '', correo: '', password: '' };
  }

  private finalizarGuardado(texto: string): void {
    this.guardando.set(false);
    this.cancelar();
    this.mensaje.set(texto);
    this.cargar();
  }

  private mostrarError(error: HttpErrorResponse): void {
    this.mensaje.set(error.error?.mensaje ?? 'No fue posible comunicarse con la API.');
  }
}

