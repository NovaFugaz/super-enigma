package com.patito.sonidoVivo.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() { super("Correo o contraseña incorrectos."); }
}
