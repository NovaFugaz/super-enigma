package com.patito.sonidoVivo.dto.pedido;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.patito.sonidoVivo.enums.ShippingMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import java.util.List;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderCreateRequest(

        @NotNull(message = "El envío es obligatorio")
        @Valid
        ShippingRequest shipping,

        @NotEmpty(message = "El pedido debe tener al menos un producto")
        @Size(max = 50, message = "El pedido no puede superar los 50 productos")
        List<@Valid OrderItemRequest> items,

        @NotNull(message = "Debes indicar el resultado del pago simulado")
        @Schema(description = "Solo para pruebas: simula la respuesta de una pasarela; no representa un pago real")
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
                return address != null && !address.isBlank()
                        && (pickupId == null || pickupId.isBlank());
            }
            if (method == ShippingMethod.RETIRO) {
                return pickupId != null && !pickupId.isBlank()
                        && (address == null || address.isBlank());
            }
            return false;
        }
    }
}