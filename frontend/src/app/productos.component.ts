import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { ApiService } from './api.service';
import { Producto } from './modelos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit {
  private api = inject(ApiService);

  productos = signal<Producto[]>([]);
  mensaje = signal('');
  guardando = signal(false);

  idEdicion: string | null = null;

  /*
   * Los campos numéricos pueden quedar vacíos en el formulario.
   * Por eso admitimos null mientras el usuario escribe.
   */
  formulario: {
    nombre: string;
    precio: number | null;
    existencia: number | null;
  } = {
    nombre: '',
    precio: null,
    existencia: null,
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.listarProductos().subscribe({
      next: (datos) => this.productos.set(datos),
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  guardar(): void {
    if (this.guardando()) return;

    const { nombre, precio, existencia } = this.formulario;

    // Validación adicional antes de enviar los datos.
    if (
      !nombre.trim() ||
      precio === null ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      existencia === null ||
      !Number.isInteger(existencia) ||
      existencia < 0
    ) {
      this.mensaje.set('Revise el nombre, el precio y la existencia.');
      return;
    }

    const datos: Producto = {
      nombre: nombre.trim(),
      precio,
      existencia,
    };

    this.guardando.set(true);
    this.mensaje.set('');

    if (this.idEdicion) {
      this.api.actualizarProducto(this.idEdicion, datos).subscribe({
        next: () => this.finalizarGuardado('Producto actualizado.'),
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);
          this.mostrarError(error);
        },
      });
    } else {
      this.api.crearProducto(datos).subscribe({
        next: () => this.finalizarGuardado('Producto creado.'),
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);
          this.mostrarError(error);
        },
      });
    }
  }

  editar(producto: Producto): void {
    if (!producto._id) return;

    this.idEdicion = producto._id;

    // Copiamos los valores del registro al formulario.
    this.formulario = {
      nombre: producto.nombre,
      precio: producto.precio,
      existencia: producto.existencia,
    };

    this.mensaje.set('');
  }

  eliminar(producto: Producto): void {
    if (!producto._id) return;

    if (!confirm(`¿Eliminar el producto ${producto.nombre}?`)) return;

    this.api.eliminarProducto(producto._id).subscribe({
      next: () => {
        if (this.idEdicion === producto._id) {
          this.cancelar();
        }

        this.mensaje.set('Producto eliminado.');
        this.cargar();
      },
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  cancelar(): void {
    this.idEdicion = null;

    this.formulario = {
      nombre: '',
      precio: null,
      existencia: null,
    };
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
