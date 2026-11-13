package com.patito.sonidoVivo.exception;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String email){
        super("Ya existe un usuario registrado con el email: " + email);
    }
}