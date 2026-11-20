package com.patito.sonidoVivo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.patito.sonidoVivo.dto.pedido.OrderCreateRequest;
import com.patito.sonidoVivo.dto.pedido.OrderCreateRequest.ShippingRequest;
import com.patito.sonidoVivo.dto.pedido.OrderItemRequest;
import com.patito.sonidoVivo.dto.pedido.OrderStatusRequest;
import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.enums.ShippingMethod;
import com.patito.sonidoVivo.model.Category;
import com.patito.sonidoVivo.model.Location;
import com.patito.sonidoVivo.model.Product;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.config.DemoCatalogSeeder;
import com.patito.sonidoVivo.repository.CategoryRepository;
import com.patito.sonidoVivo.repository.CustomerOrderRepository;
import com.patito.sonidoVivo.repository.LocationRepository;
import com.patito.sonidoVivo.repository.ProductRepository;
import com.patito.sonidoVivo.repository.UserRepository;
import com.patito.sonidoVivo.service.OrderService;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:sonidovivo-test;DB_CLOSE_DELAY=-1",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class SonidoVivoApplicationTests {

	@Autowired
	private OrderService orderService;

	@Autowired
	private UserRepository users;

	@Autowired
	private CategoryRepository categories;

	@Autowired
	private ProductRepository products;

	@Autowired
	private CustomerOrderRepository orders;

	@Autowired
	private LocationRepository locations;

	@Autowired
	private DemoCatalogSeeder demoCatalogSeeder;

	@Test
	void contextLoads() {
	}

	@Test
	@Transactional
	void loadsProvidedCatalogAndPickupLocationsIdempotently() throws Exception {
		assertEquals(10, categories.count());
		assertEquals(51, products.count());
		assertEquals(3, locations.count());
		assertEquals("tienda", locations.findById("tienda").orElseThrow().getId());
		assertEquals(LocationType.STORE, locations.findById("tienda").orElseThrow().getType());
		assertEquals(LocationType.PICKUP, locations.findById("retiro-centro").orElseThrow().getType());
		assertEquals(LocationType.PICKUP, locations.findById("retiro-chile").orElseThrow().getType());

		Product guitar = products.findById("GA001").orElseThrow();
		guitar.setStock(1);
		products.saveAndFlush(guitar);
		demoCatalogSeeder.seed();

		assertEquals(10, categories.count());
		assertEquals(51, products.count());
		assertEquals(3, locations.count());
		assertEquals(1, products.findById("GA001").orElseThrow().getStock());
	}

	@Test
	@Transactional
	void createsAndPersistsOrderWithStockAndTrackingHistory() {
		String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
		User customer = new User();
		customer.setName("Cliente prueba");
		customer.setPhone("+56912345678");
		customer.setEmail("cliente-" + suffix + "@example.test");
		customer.setPasswordHash("test-password-hash");
		customer.setRole(Role.CUSTOMER);
		customer.setActive(true);
		customer = users.saveAndFlush(customer);

		User seller = new User();
		seller.setName("Vendedor prueba");
		seller.setPhone("+56912345679");
		seller.setEmail("vendedor-" + suffix + "@example.test");
		seller.setPasswordHash("test-password-hash");
		seller.setRole(Role.SELLER);
		seller.setActive(true);
		seller = users.saveAndFlush(seller);

		Category category = new Category();
		category.setSlug("test-" + suffix.toLowerCase());
		category.setName("Categoría prueba");
		category = categories.saveAndFlush(category);

		Product product = new Product();
		product.setCode("TEST-" + suffix.toUpperCase());
		product.setCategory(category);
		product.setName("Producto de prueba");
		product.setPrice(10_000);
		product.setStock(5);
		product.setActive(true);
		product = products.saveAndFlush(product);

		var response = orderService.create(
				new OrderCreateRequest(
						new ShippingRequest(ShippingMethod.DOMICILIO, "Calle de prueba 123", null),
						List.of(new OrderItemRequest(product.getCode(), 2)),
						true),
				customer.getId().toString());

		assertEquals(20_000, response.subtotal());
		assertEquals(4_990, response.shippingCost());
		assertEquals(24_990, response.total());
		assertEquals(3, products.findById(product.getCode()).orElseThrow().getStock());
		assertNotNull(orders.findByTrackingNumber(response.trackingNumber()).orElseThrow());
		var myOrders = orderService.findMine(customer.getId().toString());
		assertEquals(1, myOrders.size());
		assertEquals(response.id(), myOrders.getFirst().id());
		assertEquals(response.total(), myOrders.getFirst().total());
		assertEquals(List.of("PENDIENTE", "EN_PROCESO"),
				myOrders.getFirst().statusHistory().stream().map(update -> update.status().name()).toList());
		assertEquals(2, response.statusHistory().size());

		var updated = orderService.updateStatus(response.id(),
				new OrderStatusRequest(OrderStatus.VALIDADO), seller.getId().toString());
		assertEquals(OrderStatus.VALIDADO, updated.status());
		assertEquals(3, updated.statusHistory().size());
	}
}
