package com.patito.sonidoVivo.dto.pedido;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.patito.sonidoVivo.enums.ShippingMethod;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(title = "OrderCreateRequest", description = "Datos necesarios para crear un pedido con detalle de envío, productos y resultado del pago simulado")
public record OrderCreateRequest(

        @NotNull(message = "El envío es obligatorio") 
        @Valid 
        @Schema(description = "Información del método de entrega y destino del pedido") 
        ShippingRequest shipping,

        @NotEmpty(message = "El pedido debe tener al menos un producto") 
        @Size(max = 50, message = "El pedido no puede superar los 50 productos") 
        @Schema(description = "Lista de productos y cantidades incluidas en el pedido") 
        List<@Valid OrderItemRequest> items,

        @NotNull(message = "Debes indicar el resultado del pago simulado") 
        @Schema(description = "Solo para pruebas: simula la respuesta de una pasarela; no representa un pago real", example = "true") 
        Boolean paymentApproved) {

        @Schema(title = "Shipping Request", description = "Detalle de entrega: requiere dirección si el método es DOMICILIO, o pickupId si es RETIRO")
        public record ShippingRequest(

                @NotNull(message = "El método de envío es obligatorio") 
                @Schema(description = "Modalidad de entrega del pedido (DOMICILIO o RETIRO)", example = "DOMICILIO") 
                ShippingMethod method,

                @Size(max = 200, message = "La dirección no puede superar los 200 caracteres") 
                @Schema(description = "Dirección completa de entrega (obligatoria cuando method es DOMICILIO)", 
                        example = "Av. Siempre Viva 123", nullable = true) 
                String address,

                @Size(max = 40, message = "El punto de retiro no es válido") 
                @Schema(description = "Identificador del punto de retiro (obligatorio cuando method es RETIRO)", 
                        example = "null", nullable = true) // quedaba como TIENDA xd
                String pickupId) {

                @JsonIgnore
                @Schema(hidden = true)
                @AssertTrue(message = "Indica la dirección (domicilio) o el punto de retiro (retiro)")
                public boolean isDestinationValid() {
                        if (method == ShippingMethod.DOMICILIO) {
                                return address != null && !address.isBlank();
                        }
                        if (method == ShippingMethod.RETIRO) {
                                return pickupId != null && !pickupId.isBlank();
                        }
                        return false;
                }
        }
}