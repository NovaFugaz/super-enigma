package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.pedido.OrderCreateRequest;
import com.patito.sonidoVivo.dto.pedido.OrderMineResponse;
import com.patito.sonidoVivo.dto.pedido.OrderResponse;
import com.patito.sonidoVivo.dto.pedido.OrderTrackingResponse;
import com.patito.sonidoVivo.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Creación, consulta y seguimiento de pedidos")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Crear pedido del cliente autenticado",
        description = "Precios, iva, despacho y stock."
    )
    @ApiResponse(responseCode = "400", description = "Datos inválidos o stock insuficiente")
    public OrderResponse create(
            @Valid @RequestBody OrderCreateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return orderService.create(request, jwt.getSubject());
    }

    @GetMapping("/mine")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar pedidos del cliente autenticado")
    public List<OrderMineResponse> mine(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return orderService.findMine(jwt.getSubject());
    }

    @GetMapping("/tracking/{trackingNumber}")
    @Operation(summary = "Consultar seguimiento público con su número de seguimiento")
    @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    public OrderTrackingResponse track(@PathVariable String trackingNumber) {
        return orderService.track(trackingNumber);
    }
}
