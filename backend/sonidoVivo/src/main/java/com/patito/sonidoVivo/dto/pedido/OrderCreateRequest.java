package com.patito.sonidoVivo.dto.pedido;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.patito.sonidoVivo.enums.ShippingMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

@Schema(title = "OrderCreateRequest", description = "Datos necesarios para crear un nuevo pedido con detalle de envío, productos y resultado de pago")
public record OrderCreateRequest(

        @NotNull(message = "El envío es obligatorio") 
        @Valid 
        @Schema(description = "Información del método de entrega y destino del pedido") 
        ShippingRequest shipping,

        @NotEmpty(message = "El pedido debe tener al menos un producto") 
        @Valid 
        @Schema(description = "Lista de productos y cantidades incluidas en el pedido") 
        List<OrderItemRequest> items,

        @NotNull(message = "Debes indicar el resultado del pago simulado") 
        @Schema(description = "Indica si la transacción de pago simulada fue aprobada (true) o rechazada (false)", example = "true") 
        Boolean paymentApproved) {

    @Schema(title = "Shipping Request", description = "Detalle de entrega: requiere dirección si el método es DOMICILIO, o pickupId si es RETIRO")
    public record ShippingRequest(

            @NotNull(message = "El método de envío es obligatorio") 
            @Schema(description = "Modalidad de entrega del pedido (DOMICILIO o RETIRO)", example = "DOMICILIO") 
            ShippingMethod method,

            @Size(max = 200, message = "La dirección no puede superar los 200 caracteres") 
            @Schema(description = "Dirección completa de entrega (obligatoria cuando method es DOMICILIO)", example = "", nullable = true) 
            String address,

            @Size(max = 40, message = "El punto de retiro no es válido") 
            @Schema(description = "Identificador de la sucursal o punto de retiro (obligatorio cuando method es RETIRO)", example = "", nullable = true) 
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
            return true;
        }
    }
}
