# Backend Order DTO Fix Guide

## Problem
The `OrderItem` entity has `@NotNull` validation on `orderId`, causing order creation to fail since the ID doesn't exist yet.

## Solution
Create separate DTOs for request and response to handle order creation properly.

---

## Step 1: Create `OrderItemRequestDTO.java`

```java
package com.yasso.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class OrderItemRequestDTO {
    
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;
    
    // Optional field for color variants
    private String selectedColor;
}
```

---

## Step 2: Create `OrderRequestDTO.java`

```java
package com.yasso.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDTO {
    
    @NotBlank(message = "Customer name is required")
    private String customerName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;
    
    @NotBlank(message = "Phone number is required")
    private String customerPhone;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "Street name is required")
    private String streetName;
    
    @NotBlank(message = "Building number is required")
    private String buildingNumber;
    
    private String floor;
    
    private String apartmentNumber;
    
    private String whatsappNumber;
    
    private String notes;
    
    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequestDTO> orderItems;
}
```

---

## Step 3: Update `OrderController.java`

```java
package com.yasso.controller;

import com.yasso.dto.OrderRequestDTO;
import com.yasso.dto.OrderItemRequestDTO;
import com.yasso.entity.Order;
import com.yasso.entity.OrderItem;
import com.yasso.entity.Product;
import com.yasso.service.OrderService;
import com.yasso.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final ProductService productService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequestDTO orderRequest) {
        try {
            // Create Order entity from DTO
            Order order = new Order();
            order.setCustomerName(orderRequest.getCustomerName());
            order.setCustomerEmail(orderRequest.getCustomerEmail());
            order.setCustomerPhone(orderRequest.getCustomerPhone());
            order.setCity(orderRequest.getCity());
            order.setStreetName(orderRequest.getStreetName());
            order.setBuildingNumber(orderRequest.getBuildingNumber());
            order.setFloor(orderRequest.getFloor());
            order.setApartmentNumber(orderRequest.getApartmentNumber());
            order.setWhatsappNumber(orderRequest.getWhatsappNumber() != null ? 
                orderRequest.getWhatsappNumber() : orderRequest.getCustomerPhone());
            order.setNotes(orderRequest.getNotes());
            order.setOrderDate(LocalDateTime.now());
            order.setOrderStatus("PENDING");
            
            // Calculate total and create order items
            List<OrderItem> orderItems = new ArrayList<>();
            double totalAmount = 0.0;
            
            for (OrderItemRequestDTO itemDTO : orderRequest.getOrderItems()) {
                // Fetch product to validate and get details
                Product product = productService.getProductById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDTO.getProductId()));
                
                // IMPORTANT: Validate stock for the specific color variant
                if (itemDTO.getSelectedColor() != null && !itemDTO.getSelectedColor().isEmpty()) {
                    // Find the color variant
                    ColorVariant selectedVariant = product.getColorVariants().stream()
                        .filter(variant -> variant.getColor().equalsIgnoreCase(itemDTO.getSelectedColor()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException(
                            "Color variant not found: " + itemDTO.getSelectedColor() + " for product: " + product.getName()
                        ));
                    
                    // Check if enough stock for this color
                    if (selectedVariant.getStockQuantity() < itemDTO.getQuantity()) {
                        throw new RuntimeException(
                            "Insufficient stock for product: " + product.getName() + 
                            " (Color: " + itemDTO.getSelectedColor() + 
                            "). Available: " + selectedVariant.getStockQuantity() + 
                            ", Requested: " + itemDTO.getQuantity()
                        );
                    }
                    
                    // Deduct stock from the specific color variant
                    selectedVariant.setStockQuantity(selectedVariant.getStockQuantity() - itemDTO.getQuantity());
                } else {
                    // If no color specified, check total stock (legacy support)
                    int totalStock = product.getColorVariants().stream()
                        .mapToInt(ColorVariant::getStockQuantity)
                        .sum();
                    
                    if (totalStock < itemDTO.getQuantity()) {
                        throw new RuntimeException(
                            "Insufficient stock for product: " + product.getName() + 
                            ". Available: " + totalStock + 
                            ", Requested: " + itemDTO.getQuantity()
                        );
                    }
                }
                
                // Create OrderItem
                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(itemDTO.getProductId());
                orderItem.setProductName(product.getName());
                orderItem.setQuantity(itemDTO.getQuantity());
                orderItem.setUnitPrice(itemDTO.getPrice());
                orderItem.setSubtotal(itemDTO.getPrice() * itemDTO.getQuantity());
                orderItem.setSelectedColor(itemDTO.getSelectedColor());
                orderItem.setOrder(order); // Set bidirectional relationship
                
                orderItems.add(orderItem);
                totalAmount += orderItem.getSubtotal();
            }
            
            order.setOrderItems(orderItems);
            order.setTotalAmount(totalAmount);
            
            // Save order (cascade will save order items and update product stock)
            Order savedOrder = orderService.createOrder(order);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }
    
    // Keep existing GET, PATCH, DELETE methods...
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateOrderStatus(id, status)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Step 4: Update `OrderItem` Entity (Remove @NotNull from orderId)

```java
package com.yasso.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Remove @NotNull from orderId - it's set automatically
    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @Column(name = "product_name")
    private String productName;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;
    
    @Column(nullable = false)
    private Double subtotal;
    
    @Column(name = "selected_color")
    private String selectedColor;
}
```

---

## Step 5: Update `Order` Entity (Add cascade for OrderItems)

```java
package com.yasso.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "customer_name", nullable = false)
    private String customerName;
    
    @Column(name = "customer_email", nullable = false)
    private String customerEmail;
    
    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;
    
    @Column(nullable = false)
    private String city;
    
    @Column(name = "street_name", nullable = false)
    private String streetName;
    
    @Column(name = "building_number", nullable = false)
    private String buildingNumber;
    
    private String floor;
    
    @Column(name = "apartment_number")
    private String apartmentNumber;
    
    @Column(name = "whatsapp_number")
    private String whatsappNumber;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "order_status", nullable = false)
    private String orderStatus = "PENDING";
    
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;
    
    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderItem> orderItems = new ArrayList<>();
}
```

---

## Benefits of This Approach

1. ✅ **Clean separation** - Request DTOs don't include database-generated fields
2. ✅ **Proper validation** - Only validate fields needed for creation
3. ✅ **Type safety** - DTOs prevent accidental inclusion of wrong fields
4. ✅ **Security** - Can't manipulate orderId or other computed fields
5. ✅ **Maintainability** - Easy to modify request/response structures independently

---

## Testing

After implementing these changes:

1. Restart your Spring Boot backend
2. Test order creation from the checkout page
3. Verify orders appear in the admin dashboard
4. Check that all order details (including selectedColor) are saved correctly

---

## Expected Request Format

```json
{
  "customerName": "محمد عوض",
  "customerEmail": "test@example.com",
  "customerPhone": "01279832474",
  "city": "Al qalyubia",
  "streetName": "15 may street",
  "buildingNumber": "15",
  "floor": "1",
  "apartmentNumber": "3",
  "whatsappNumber": "01279832474",
  "notes": "",
  "orderItems": [
    {
      "productId": 3,
      "quantity": 1,
      "price": 6000,
      "selectedColor": "White"
    }
  ]
}
```

---

## Expected Response Format

```json
{
  "id": 1,
  "customerName": "محمد عوض",
  "customerEmail": "test@example.com",
  "customerPhone": "01279832474",
  "city": "Al qalyubia",
  "streetName": "15 may street",
  "buildingNumber": "15",
  "floor": "1",
  "apartmentNumber": "3",
  "whatsappNumber": "01279832474",
  "notes": "",
  "orderStatus": "PENDING",
  "totalAmount": 6000.0,
  "orderDate": "2026-02-21T02:45:00",
  "orderItems": [
    {
      "id": 1,
      "productId": 3,
      "productName": "Product Name",
      "quantity": 1,
      "unitPrice": 6000.0,
      "subtotal": 6000.0,
      "selectedColor": "White"
    }
  ]
}
```

---

## Common Issues

**Issue**: `orderId is required` validation error  
**Fix**: Make sure `OrderItemRequestDTO` doesn't have `orderId` field

**Issue**: OrderItems not saving  
**Fix**: Ensure `cascade = CascadeType.ALL` on `Order.orderItems`

**Issue**: Product not found  
**Fix**: Verify products exist in database before creating orders

**Issue**: `Insufficient stock for product` error  
**Cause**: The backend is checking stock but the color variant doesn't have enough stock in the database  
**Fix**: 
1. Check your database - query the `color_variants` table for product ID 3:
   ```sql
   SELECT * FROM color_variants WHERE product_id = 3;
   ```
2. Verify the stock quantities for each color:
   - White: needs at least 1
   - Black: needs at least 3
   - Red: needs at least 1
   - Gray: needs at least 4
3. Update stock if needed via admin dashboard or directly in database
4. Make sure the stock validation in OrderController checks the correct color variant's stock

---

## Files to Create/Modify

- ✅ Create: `dto/OrderRequestDTO.java`
- ✅ Create: `dto/OrderItemRequestDTO.java`
- ✅ Modify: `controller/OrderController.java`
- ✅ Modify: `entity/OrderItem.java` (remove @NotNull from orderId)
- ✅ Modify: `entity/Order.java` (add cascade)
