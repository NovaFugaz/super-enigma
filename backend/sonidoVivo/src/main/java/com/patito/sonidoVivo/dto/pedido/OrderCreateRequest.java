package com.patito.sonidoVivo.dto.pedido;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.patito.sonidoVivo.enums.ShippingMethod;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record OrderCreateRequest(

        @NotNull(message = "El envío es obligatorio")
        @Valid
        ShippingRequest shipping,

        @NotEmpty(message = "El pedido debe tener al menos un producto")
        @Valid
        List<OrderItemRequest> items,

        @NotNull(message = "Debes indicar el resultado del pago simulado")
        Boolean paymentApproved
) {
    public record ShippingRequest(

            @NotNull(message = "El método de envío es obligatorio")
            ShippingMethod method,

            @Size(max = 200, message = "La dirección no puede superar los 200 caracteres")
            String address,

            @Size(max = 40, message = "El punto de retiro no es válido")
            String pickupId
    ) {
        @JsonIgnore
        @AssertTrue(message = "Indica la dirección (domicilio) o el punto de retiro (retiro)")
        public boolean isDestinationValid() {
            if (method == ShippingMethod.DOMICILIO) {
                return address != null && !address.isBlank();
            }
            if (method == ShippingMethod.RETIRO) {
                return pickupId != null && !pickupId.isBlank();
            }
            return true; 
        }
    }
}