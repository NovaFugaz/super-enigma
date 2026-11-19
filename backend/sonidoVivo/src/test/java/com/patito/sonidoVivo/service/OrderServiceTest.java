package com.patito.sonidoVivo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.dto.pedido.OrderCreateRequest;
import com.patito.sonidoVivo.dto.pedido.OrderCreateRequest.ShippingRequest;
import com.patito.sonidoVivo.dto.pedido.OrderItemRequest;
import com.patito.sonidoVivo.dto.pedido.OrderStatusRequest;
import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.enums.ShippingMethod;
import com.patito.sonidoVivo.model.CustomerOrder;
import com.patito.sonidoVivo.model.Location;
import com.patito.sonidoVivo.model.Product;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.CustomerOrderRepository;
import com.patito.sonidoVivo.repository.LocationRepository;
import com.patito.sonidoVivo.repository.ProductRepository;
import com.patito.sonidoVivo.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private CustomerOrderRepository orders;

    @Mock
    private ProductRepository products;

    @Mock
    private UserRepository users;

    @Mock
    private LocationRepository locations;

    @InjectMocks
    private OrderService orderService;

    private User customer;

    @Test
    void createsHomeDeliveryOrderUsingServerProductPriceAndCalculatesTaxIncludedTotals() {
        stubCustomer();
        stubOrderSaving();
        Product product = product("GA001", 10_000, 5);
        when(products.findByCodeForUpdate("GA001")).thenReturn(Optional.of(product));

        var response = orderService.create(request(ShippingMethod.DOMICILIO, "Calle 123", null,
                List.of(new OrderItemRequest("GA001", 2)), true), "7");

        assertEquals(20_000, response.subtotal());
        assertEquals(4_990, response.shippingCost());
        assertEquals(3_990, response.tax());
        assertEquals(24_990, response.total());
        assertEquals(3, product.getStock());
        assertEquals("GA001", response.items().getFirst().code());
        assertNotNull(response.trackingNumber());
        assertEquals(OrderStatus.EN_PROCESO, response.status());
        verify(orders).saveAndFlush(any(CustomerOrder.class));
    }

    @Test
    void makesHomeDeliveryFreeAtTheConfiguredThreshold() {
        stubCustomer();
        stubOrderSaving();
        Product product = product("GA001", 150_000, 2);
        when(products.findByCodeForUpdate("GA001")).thenReturn(Optional.of(product));

        var response = orderService.create(request(ShippingMethod.DOMICILIO, "Calle 123", null,
                List.of(new OrderItemRequest("GA001", 1)), true), "7");

        assertEquals(0, response.shippingCost());
        assertEquals(150_000, response.total());
        assertEquals(23_950, response.tax());
    }

    @Test
    void aggregatesRepeatedProductLinesBeforeCheckingAndDeductingStock() {
        stubCustomer();
        stubOrderSaving();
        Location pickup = new Location();
        pickup.setId("retiro-vina");
        pickup.setType(LocationType.PICKUP);
        when(locations.findById("retiro-vina")).thenReturn(Optional.of(pickup));
        Product product = product("GA001", 1_000, 5);
        when(products.findByCodeForUpdate("GA001")).thenReturn(Optional.of(product));

        var response = orderService.create(request(ShippingMethod.RETIRO, null, "retiro-vina",
                List.of(new OrderItemRequest("ga001", 2), new OrderItemRequest("GA001", 1)), true),
                "7");

        assertEquals(1, response.items().size());
        assertEquals(3, response.items().getFirst().quantity());
        assertEquals(2, product.getStock());
        assertEquals(0, response.shippingCost());
        verify(products).findByCodeForUpdate("GA001");
    }

    @Test
    void rejectsUnapprovedDemoPaymentWithoutChangingStockOrSavingOrder() {
        stubCustomer();
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> orderService.create(
                request(ShippingMethod.DOMICILIO, "Calle 123", null,
                        List.of(new OrderItemRequest("GA001", 1)), false), "7"));

        assertEquals(HttpStatus.PAYMENT_REQUIRED, exception.getStatusCode());
        verify(products, never()).findByCodeForUpdate("GA001");
        verify(orders, never()).saveAndFlush(any(CustomerOrder.class));
    }

    @Test
    void rejectsInsufficientStockWithoutSavingOrder() {
        stubCustomer();
        Product product = product("GA001", 10_000, 1);
        when(products.findByCodeForUpdate("GA001")).thenReturn(Optional.of(product));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> orderService.create(request(ShippingMethod.DOMICILIO, "Calle 123", null,
                        List.of(new OrderItemRequest("GA001", 2)), true), "7"));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals(1, product.getStock());
        verify(orders, never()).saveAndFlush(any(CustomerOrder.class));
    }

    @Test
    void rejectsInactiveProduct() {
        stubCustomer();
        Product product = product("GA001", 10_000, 5);
        product.setActive(false);
        when(products.findByCodeForUpdate("GA001")).thenReturn(Optional.of(product));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> orderService.create(request(ShippingMethod.DOMICILIO, "Calle 123", null,
                        List.of(new OrderItemRequest("GA001", 1)), true), "7"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(orders, never()).saveAndFlush(any(CustomerOrder.class));
    }

    @Test
    void allowsStoreAsPickupLocation() {
        stubCustomer();
        stubOrderSaving();
        Location location = new Location();
        location.setId("tienda");
        location.setType(LocationType.STORE);
        location.setName("Sonido Vivo - Tienda");
        location.setAddress("Av. Valparaíso 581");
        when(locations.findById("tienda")).thenReturn(Optional.of(location));
        when(products.findByCodeForUpdate("GA001")).thenReturn(Optional.of(product("GA001", 10_000, 5)));

        var response = orderService.create(request(ShippingMethod.RETIRO, null, "tienda",
                List.of(new OrderItemRequest("GA001", 1)), true), "7");

        assertEquals("Sonido Vivo - Tienda", response.shipping().pickup().name());
        assertEquals(0, response.shippingCost());
        verify(orders).saveAndFlush(any(CustomerOrder.class));
    }

    @Test
    void recordsStaffActorWhenChangingToAnAllowedStatus() {
        User seller = user(9L, Role.SELLER);
        customer = user(7L, Role.CUSTOMER);
        CustomerOrder order = order("SV-TEST", OrderStatus.EN_PROCESO, customer);
        stubOrderSaving();
        when(users.findById(9L)).thenReturn(Optional.of(seller));
        when(orders.findByIdForUpdate("SV-TEST")).thenReturn(Optional.of(order));

        var response = orderService.updateStatus("SV-TEST",
                new OrderStatusRequest(OrderStatus.VALIDADO), "9");

        assertEquals(OrderStatus.VALIDADO, response.status());
        assertEquals(OrderStatus.EN_PROCESO, response.statusHistory().getLast().from());
        assertEquals("Usuario 9", response.statusHistory().getLast().actorName());
        verify(orders).saveAndFlush(order);
    }

    @Test
    void rejectsInvalidOrderStatusTransition() {
        User seller = user(9L, Role.SELLER);
        customer = user(7L, Role.CUSTOMER);
        CustomerOrder order = order("SV-TEST", OrderStatus.EN_PROCESO, customer);
        when(users.findById(9L)).thenReturn(Optional.of(seller));
        when(orders.findByIdForUpdate("SV-TEST")).thenReturn(Optional.of(order));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> orderService.updateStatus("SV-TEST",
                        new OrderStatusRequest(OrderStatus.ENTREGADO), "9"));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(orders, never()).saveAndFlush(any(CustomerOrder.class));
    }

    @Test
    void trackingResponseContainsNoCustomerOrPaymentFields() {
        CustomerOrder order = order("SV-TEST", OrderStatus.EN_PROCESO, customer);
        when(orders.findByTrackingNumber("TRK-TEST")).thenReturn(Optional.of(order));

        var response = orderService.track("TRK-TEST");

        assertEquals("SV-TEST", response.id());
        assertEquals(OrderStatus.EN_PROCESO, response.status());
        assertEquals(List.of("id", "trackingNumber", "status", "createdAt", "shippingMethod",
                "items", "statusHistory"),
                java.util.Arrays.stream(response.getClass().getRecordComponents())
                        .map(component -> component.getName()).toList());
    }

    @Test
    void listsOnlyTheAuthenticatedCustomersOrders() {
        stubCustomer();
        when(orders.findAllByCustomer_IdOrderByCreatedAtDesc(7L))
                .thenReturn(List.of(order("SV-MINE", OrderStatus.EN_PROCESO, customer)));

        var response = orderService.findMine("7");

        assertEquals(List.of("SV-MINE"), response.stream().map(order -> order.id()).toList());
        verify(orders).findAllByCustomer_IdOrderByCreatedAtDesc(7L);
    }

    private static OrderCreateRequest request(ShippingMethod method, String address, String pickupId,
            List<OrderItemRequest> items, boolean paymentApproved) {
        return new OrderCreateRequest(new ShippingRequest(method, address, pickupId), items, paymentApproved);
    }

    private void stubCustomer() {
        customer = user(7L, Role.CUSTOMER);
        when(users.findById(7L)).thenReturn(Optional.of(customer));
    }

    private void stubOrderSaving() {
        when(orders.saveAndFlush(any(CustomerOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private static Product product(String code, int price, int stock) {
        Product product = new Product();
        product.setCode(code);
        product.setName("Producto " + code);
        product.setPrice(price);
        product.setStock(stock);
        product.setActive(true);
        return product;
    }

    private static User user(Long id, Role role) {
        User user = new User();
        user.setId(id);
        user.setName("Usuario " + id);
        user.setEmail("usuario" + id + "@example.test");
        user.setRole(role);
        user.setActive(true);
        return user;
    }

    private static CustomerOrder order(String id, OrderStatus status, User customer) {
        CustomerOrder order = new CustomerOrder();
        order.setId(id);
        order.setTrackingNumber("TRK-TEST");
        order.setCustomer(customer);
        order.setStatus(status);
        order.setShippingMethod(ShippingMethod.DOMICILIO);
        order.setSubtotal(10_000);
        order.setTax(1_597);
        order.setShippingCost(4_990);
        order.setTotal(14_990);
        return order;
    }
}
