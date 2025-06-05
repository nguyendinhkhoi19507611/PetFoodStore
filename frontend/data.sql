-- Create database
CREATE DATABASE IF NOT EXISTS petfoodstore;
USE petfoodstore;

-- Insert sample users
INSERT INTO users (username, email, password, full_name, phone, address, role, active, created_at) VALUES
('admin', 'admin@petfoodstore.com', '$2a$10$EOs8VROb14e7ZnydvXECA.4LoIhPOoFHKvVF/iBZ/ker17Eocz4Tu', 'Admin User', '0123456789', '123 Admin Street', 'ADMIN', true, NOW()),
('employee', 'employee@petfoodstore.com', '$2a$10$EOs8VROb14e7ZnydvXECA.4LoIhPOoFHKvVF/iBZ/ker17Eocz4Tu', 'Employee User', '0123456788', '456 Employee Street', 'EMPLOYEE', true, NOW()),
('customer', 'customer@petfoodstore.com', '$2a$10$EOs8VROb14e7ZnydvXECA.4LoIhPOoFHKvVF/iBZ/ker17Eocz4Tu', 'Customer User', '0123456787', '789 Customer Street', 'CUSTOMER', true, NOW());

-- Note: Password for all users is 'password123' (bcrypt encoded)

-- Insert sample products
INSERT INTO products (name, description, price, quantity, category, brand, image_url, pet_type, active, created_at) VALUES
('Royal Canin Adult Dog Food', 'Thức ăn khô cho chó trưởng thành, giàu protein và vitamin', 450000, 50, 'Thức ăn khô', 'Royal Canin', 'https://example.com/royal-canin-dog.jpg', 'DOG', true, NOW()),
('Whiskas Tuna Cat Food', 'Thức ăn ướt cho mèo vị cá ngừ, bổ sung omega-3', 25000, 100, 'Thức ăn ướt', 'Whiskas', 'https://example.com/whiskas-tuna.jpg', 'CAT', true, NOW()),
('Pedigree DentaStix', 'Bánh xương giúp làm sạch răng cho chó', 85000, 30, 'Snack & Bánh thưởng', 'Pedigree', 'https://example.com/dentastix.jpg', 'DOG', true, NOW()),
('Me-O Kitten Food', 'Thức ăn cho mèo con dưới 1 tuổi', 120000, 45, 'Thức ăn khô', 'Me-O', 'https://example.com/meo-kitten.jpg', 'CAT', true, NOW()),
('Dog Chew Toy', 'Đồ chơi nhai cho chó, giúp giảm stress', 50000, 25, 'Phụ kiện', 'Generic', 'https://example.com/dog-toy.jpg', 'DOG', true, NOW()),
('Cat Scratching Post', 'Trụ cào móng cho mèo', 350000, 15, 'Phụ kiện', 'Generic', 'https://example.com/cat-post.jpg', 'CAT', true, NOW()),
('Bird Seed Mix', 'Hỗn hợp hạt cho chim cảnh', 45000, 40, 'Thức ăn khô', 'BirdLife', 'https://example.com/bird-seed.jpg', 'BIRD', true, NOW()),
('Fish Food Flakes', 'Thức ăn dạng vảy cho cá cảnh', 35000, 60, 'Thức ăn khô', 'Tetra', 'https://example.com/fish-flakes.jpg', 'FISH', true, NOW()),
('Rabbit Pellets', 'Thức ăn viên cho thỏ', 80000, 35, 'Thức ăn khô', 'Bunny', 'https://example.com/rabbit-food.jpg', 'RABBIT', true, NOW()),
('Pet Vitamin Supplement', 'Vitamin tổng hợp cho thú cưng', 150000, 20, 'Dinh dưỡng', 'PetVit', 'https://example.com/pet-vitamin.jpg', 'OTHER', true, NOW());

-- Insert sample orders
INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, phone, notes, created_at) VALUES
('ORD20240101001', 3, 475000, 'DELIVERED', '789 Customer Street, District 1', '0123456787', 'Giao giờ hành chính', '2024-01-01 10:00:00'),
('ORD20240102002', 3, 135000, 'SHIPPED', '789 Customer Street, District 1', '0123456787', '', '2024-01-02 14:30:00'),
('ORD20240103003', 3, 350000, 'PENDING', '789 Customer Street, District 1', '0123456787', 'Gọi trước khi giao', NOW());

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 450000),
(1, 2, 1, 25000),
(2, 3, 1, 85000),
(2, 5, 1, 50000),
(3, 6, 1, 350000);

