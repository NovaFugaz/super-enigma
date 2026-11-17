package com.patito.sonidoVivo.enums;

public enum OrderStatus  {
    PENDIENTE, EN_PROCESO, VALIDADO, ENVIADO, ENTREGADO, RECHAZADO;

    public boolean puedePasarA(OrderStatus destino) {
        return switch (this) {
            case PENDIENTE  -> destino == EN_PROCESO || destino == RECHAZADO;
            case EN_PROCESO -> destino == VALIDADO   || destino == RECHAZADO;
            case VALIDADO   -> destino == ENVIADO    || destino == RECHAZADO;
            case ENVIADO    -> destino == ENTREGADO;
            case ENTREGADO, RECHAZADO -> false;
        };
    }
}
