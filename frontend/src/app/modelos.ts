export interface Usuario {
    _id?: string;
    nombre: string;
    correo: string;
    password: string;
}

export interface Producto {
    _id?: string;
    nombre: string;
    precio: number;
    existencia: number;
}

export interface Respuesta {
    mensaje: string;
    exito: boolean;
}

export interface correo {
    correo: string;
}
