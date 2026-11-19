package com.patito.sonidoVivo.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.pedido.OrderResponse;
import com.patito.sonidoVivo.dto.pedido.OrderStatusRequest;
import com.patito.sonidoVivo.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/staff/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos (staff)")
public class StaffOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Listar pedidos para gestión de staff")
    public List<OrderResponse> list() {
        return orderService.findAllForStaff();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar pedido por id para staff")
    public OrderResponse get(@PathVariable String id) {
        return orderService.findForStaff(id);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Actualizar estado del pedido y registrar el actor")
    public OrderResponse updateStatus(@PathVariable String id,
            @Valid @RequestBody OrderStatusRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return orderService.updateStatus(id, request, jwt.getSubject());
    }
}
