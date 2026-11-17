package com.patito.sonidoVivo.dto.reports;

import java.time.LocalDate;
import java.util.List;

public record SalesReportResponse(
        Integer days,
        int orderCount,
        long totalSales,
        long unitsSold,
        List<SalesByDate> salesByDate,
        List<TopProduct> topProducts
) {
    public record SalesByDate(LocalDate date, long orders, long total) {}

    public record TopProduct(String code, String name, long units, long revenue) {}
}