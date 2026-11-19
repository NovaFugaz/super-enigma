package com.patito.sonidoVivo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.dto.pedido.OrderCreateRequest;
import com.patito.sonidoVivo.dto.pedido.OrderResponse;
import com.patito.sonidoVivo.dto.pedido.OrderStatusRequest;
import com.patito.sonidoVivo.dto.pedido.OrderTrackingResponse;
import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.enums.ShippingMethod;
import com.patito.sonidoVivo.model.CustomerOrder;
import com.patito.sonidoVivo.model.Location;
import com.patito.sonidoVivo.model.OrderItem;
import com.patito.sonidoVivo.model.OrderStatusHistory;
import com.patito.sonidoVivo.model.Product;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.CustomerOrderRepository;
import com.patito.sonidoVivo.repository.LocationRepository;
import com.patito.sonidoVivo.repository.ProductRepository;
import com.patito.sonidoVivo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int HOME_SHIPPING_COST = 4_990;
    private static final int FREE_SHIPPING_FROM = 150_000;
    private static final BigDecimal IVA_DIVISOR = BigDecimal.valueOf(1.19);
    private static final char[] AUTHORIZATION_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final CustomerOrderRepository orders;
    private final ProductRepository products;
    private final UserRepository users;
    private final LocationRepository locations;

    @Transactional
    public OrderResponse create(OrderCreateRequest request, String customerSubject) {
        User customer = activeUser(customerSubject);
        if (customer.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo un cliente puede crear pedidos");
        }
        if (!Boolean.TRUE.equals(request.paymentApproved())) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,
                    "El pago de demostración no fue aprobado");
        }

        Location pickup = null;
        if (request.shipping().method() == ShippingMethod.RETIRO) {
            pickup = locations.findById(request.shipping().pickupId().trim())
                    .filter(location -> location.getType() == LocationType.PICKUP)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "El punto de retiro no existe o no está disponible"));
        }

        Map<String, Integer> quantitiesByCode = aggregateItems(request);
        Map<String, Product> lockedProducts = new TreeMap<>();
        int subtotal = 0;
        for (Map.Entry<String, Integer> entry : quantitiesByCode.entrySet()) {
            Product product = products.findByCodeForUpdate(entry.getKey())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Producto no encontrado: " + entry.getKey()));
            if (!product.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El producto " + product.getCode() + " no está disponible");
            }
            if (product.getStock() < entry.getValue()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Stock insuficiente para " + product.getName());
            }
            subtotal = addMoney(subtotal, multiplyMoney(product.getPrice(), entry.getValue()));
            lockedProducts.put(entry.getKey(), product);
        }

        int shippingCost = shippingCost(request.shipping().method(), subtotal);
        int total = addMoney(subtotal, shippingCost);
        int tax = total - new BigDecimal(total).divide(IVA_DIVISOR, 0, RoundingMode.HALF_UP).intValueExact();

        CustomerOrder order = new CustomerOrder();
        order.setId("SV-" + randomHex(24));
        order.setTrackingNumber("TRK-" + randomHex(24));
        order.setCustomer(customer);
        order.setStatus(OrderStatus.EN_PROCESO);
        order.setShippingMethod(request.shipping().method());
        order.setShippingAddress(request.shipping().method() == ShippingMethod.DOMICILIO
                ? request.shipping().address().trim() : null);
        order.setPickupLocation(pickup);
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setShippingCost(shippingCost);
        order.setTotal(total);
        order.setPaymentTransactionId("PAY-SIM-" + randomHex(24));
        order.setPaymentAuthorization(randomAuthorizationCode());
        order.setReceiptNumber("BOL-" + order.getId());

        for (Map.Entry<String, Integer> entry : quantitiesByCode.entrySet()) {
            Product product = lockedProducts.get(entry.getKey());
            int quantity = entry.getValue();

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setCode(product.getCode());
            item.setName(product.getName());
            item.setBrand(product.getBrand());
            item.setModel(product.getModel());
            item.setUnitPrice(product.getPrice());
            item.setQuantity(quantity);
            item.setLineTotal(multiplyMoney(product.getPrice(), quantity));
            order.addItem(item);
            product.setStock(product.getStock() - quantity);
        }

        addHistory(order, null, OrderStatus.PENDIENTE, null);
        addHistory(order, OrderStatus.PENDIENTE, OrderStatus.EN_PROCESO, null);
        return OrderResponse.from(orders.saveAndFlush(order));
    }

    // Este método es para que un cliente pueda consultar sus pedidos, pero no puede ver los detalles de pago ni envío
    @Transactional(readOnly = true)
    public List<OrderResponse> findMine(String customerSubject) {
        User customer = activeUser(customerSubject);
        if (customer.getRole() != Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo un cliente puede consultar sus pedidos");
        }
        return orders.findAllByCustomer_IdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderTrackingResponse track(String trackingNumber) {
        CustomerOrder order = orders.findByTrackingNumber(trackingNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        return OrderTrackingResponse.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findAllForStaff() {
        return orders.findAll().stream()
                .sorted((first, second) -> second.getCreatedAt().compareTo(first.getCreatedAt()))
                .map(OrderResponse::from)
                .toList();
    }

    // Este método es para que el personal pueda ver los detalles de un pedido, incluyendo la información de pago y envío
    @Transactional(readOnly = true)
    public OrderResponse findForStaff(String id) {
        return OrderResponse.from(findOrder(id));
    }

    @Transactional
    public OrderResponse updateStatus(String id, OrderStatusRequest request, String actorSubject) {
        User actor = activeUser(actorSubject);
        if (actor.getRole() != Role.SELLER && actor.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo vendedor o administrador puede gestionar pedidos");
        }

        CustomerOrder order = orders.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        OrderStatus current = order.getStatus();
        if (!current.puedePasarA(request.status())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede cambiar el pedido de " + current + " a " + request.status());
        }

        order.setStatus(request.status());
        addHistory(order, current, request.status(), actor);
        return OrderResponse.from(orders.saveAndFlush(order));
    }

    private Map<String, Integer> aggregateItems(OrderCreateRequest request) {
        Map<String, Integer> quantitiesByCode = new TreeMap<>();
        try {
            for (var item : request.items()) {
                String code = item.code().trim().toUpperCase(Locale.ROOT);
                quantitiesByCode.merge(code, item.quantity(), Math::addExact);
            }
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad solicitada es demasiado grande");
        }
        return quantitiesByCode;
    }

    private User activeUser(String subject) {
        long userId;
        try {
            userId = Long.parseLong(subject);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "El token no identifica un usuario válido");
        }
        return users.findById(userId)
                .filter(User::isActive)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "La cuenta asociada al token no existe o está desactivada"));
    }

    private CustomerOrder findOrder(String id) {
        return orders.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
    }

    private static void addHistory(CustomerOrder order, OrderStatus from, OrderStatus to, User actor) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setActor(actor);
        order.addHistory(history);
    }

    private static int shippingCost(ShippingMethod method, int subtotal) {
        if (method == ShippingMethod.DOMICILIO && subtotal < FREE_SHIPPING_FROM) {
            return HOME_SHIPPING_COST;
        }
        return 0;
    }

    private static int multiplyMoney(int price, int quantity) {
        try {
            return Math.multiplyExact(price, quantity);
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El total del pedido es demasiado grande");
        }
    }

    private static int addMoney(int first, int second) {
        try {
            return Math.addExact(first, second);
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El total del pedido es demasiado grande");
        }
    }

    // Genera un string hexadecimal aleatorio para usarlo como parte de un ID o número de seguimiento
    private static String randomHex(int length) {
        return UUID.randomUUID().toString().replace("-", "").substring(0, length).toUpperCase(Locale.ROOT);
    }

    // Genera un código de autorización aleatorio de 6 caracteres
    private static String randomAuthorizationCode() {
        StringBuilder code = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            code.append(AUTHORIZATION_CHARACTERS[SECURE_RANDOM.nextInt(AUTHORIZATION_CHARACTERS.length)]);
        }
        return code.toString();
    }
}
