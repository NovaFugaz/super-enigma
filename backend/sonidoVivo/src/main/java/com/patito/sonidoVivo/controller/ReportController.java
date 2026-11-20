package com.patito.sonidoVivo.controller;

import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patito.sonidoVivo.dto.reports.SalesReportResponse;
import com.patito.sonidoVivo.service.ReportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/reports")
@RequiredArgsConstructor 
@Tag(name = "Reportes", description = "Dashboard y métricas de venta")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    @Operation(summary = "Dashboard de ventas",
            description = "Totales, ventas por día y productos más vendidos.")
    @ApiResponse(responseCode = "400", description = "días fuera de rango")
    public SalesReportResponse sales(
            @RequestParam(required = false) Integer days) {
        return reportService.sales(days);
    }

    @GetMapping("/sales.csv")
    @Operation(summary = "Reporte de ventas",
            description = "Reporte en CSV.")
    @ApiResponse(responseCode = "400", description = "días fuera de rango")
    public ResponseEntity<String> salesReport(
            @RequestParam(required = false) Integer days) {
        String csv = reportService.salesCsv(days);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"sonido-vivo-reporte-ventas.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(csv);
    }
}
