package com.patito.sonidoVivo.dto.reports;

import java.time.LocalDate;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Sales Report Response", description = "Reporte consolidado de ventas, pedidos y productos más vendidos en un rango de días")
public record SalesReportResponse(

        @Schema(description = "Cantidad de días consultados para generar el reporte (null si abarca todo el historial)", example = "30", nullable = true) 
        Integer days,

        @Schema(description = "Cantidad total de pedidos completados en el período", example = "145") 
        int orderCount,

        @Schema(description = "Monto total recaudado en ventas en pesos chilenos (CLP)", example = "18500000") 
        long totalSales,

        @Schema(description = "Cantidad total de unidades de productos vendidas", example = "210") 
        long unitsSold,

        @Schema(description = "Desglose diario de pedidos y ventas totales ordenados por fecha") 
        List<SalesByDate> salesByDate,

        @Schema(description = "Ranking de los productos más vendidos en el período") 
        List<TopProduct> topProducts) {
    public record SalesByDate(LocalDate date, long orders, long total) {
    }

    public record TopProduct(String code, String name, long units, long revenue) {
    }
}