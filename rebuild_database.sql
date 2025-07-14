-- SQL Script to rebuild the Giggles Tea database
-- Run this script in phpMyAdmin or any MySQL client

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `giggles_tea`;

-- Use the database
USE `giggles_tea`;

-- Create products table
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `image_url` VARCHAR(255),
    `category` VARCHAR(100),
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample products (from setup_database.php)
INSERT INTO `products` (name, description, price, image_url, category) VALUES 
('Earl Grey', 'Classic black tea with bergamot oil', 4.99, 'earl-grey.jpg', 'Black Tea'),
('Jasmine Green', 'Delicate green tea with jasmine flowers', 5.99, 'jasmine-green.jpg', 'Green Tea'),
('Chamomile', 'Soothing herbal tea with chamomile flowers', 3.99, 'chamomile.jpg', 'Herbal Tea');

-- Insert additional products (from products.json.bak)
-- The Emperor's 7 Treasures
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
("The Emperor's 7 Treasures", '', 14.99, 'Tea Catalogue/21045/22855.jpg', 'Black Tea', 1);

-- Fennel Anise Caraway
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Fennel Anise Caraway', '', 12.99, 'Tea Catalogue/22898/22898.jpg', 'Herbal Tea', 1);

-- Peppermint
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Peppermint', '', 12.99, 'Tea Catalogue/22920/22920.jpg', 'Herbal Tea', 1);

-- Orange Dream
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Orange Dream', '', 12.99, 'Tea Catalogue/21024/21024.jpg', 'Fruit Tea', 1);

-- East Frisian Sunday Tea
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('East Frisian Sunday Tea', '', 14.99, 'Tea Catalogue/22939/22939.jpg', 'Black Tea', 1);

-- Sweet Sin
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Sweet Sin', '', 12.99, 'Tea Catalogue/22762/22762.jpg', 'Fruit Tea', 1);

-- Windhuk Vanilla
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Windhuk Vanilla', '', 13.99, 'Tea Catalogue/22700/22700.jpg', 'Rooibos Tea', 1);

-- Advent
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Advent', '', 12.99, 'Tea Catalogue/22789/22789.jpg', 'Fruit Tea', 1);

-- Women's Tea
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Women\'s Tea', '', 12.99, 'Tea Catalogue/22858/22858.jpg', 'Fruit Tea', 1);

-- Grandma's Garden
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Grandma\'s Garden', '', 12.99, 'Tea Catalogue/22866/22866.jpg', 'Herbal Tea', 1);

-- Gingerbread Orange
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Gingerbread Orange', '', 12.99, 'Tea Catalogue/22751/22751.jpg', 'Fruit Tea', 1);

-- Pure Rooibos
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Pure Rooibos', '', 13.99, 'Tea Catalogue/22708/22708.jpg', 'Rooibos Tea', 1);

-- Camomile
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Camomile', '', 12.99, 'Tea Catalogue/22915-2/22915.jpg', 'Herbal Tea', 1);

-- Ginger Fresh Tea
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Ginger Fresh Tea', '', 12.99, 'Tea Catalogue/22861/22861.jpg', 'Herbal Tea', 1);

-- Cool Mint
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Cool Mint', '', 12.99, 'Tea Catalogue/22847/22847.jpg', 'Herbal Tea', 1);

-- Caramel
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Caramel', '', 13.99, 'Tea Catalogue/22701/22701.jpg', 'Rooibos Tea', 1);

-- Sea Buckthorn
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Sea Buckthorn', '', 12.99, 'Tea Catalogue/22695/22695.jpg', 'Fruit Tea', 1);

-- Bad Weather Tea
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Bad Weather Tea', '', 12.99, 'Tea Catalogue/22845/22845.jpg', 'Fruit Tea', 1);

-- China Jasmine Tea
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('China Jasmine Tea', '', 14.99, 'Tea Catalogue/22508/22508.jpg', 'Green Tea', 1);

-- Green Tea Sakura
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Green Tea Sakura', '', 14.99, 'Tea Catalogue/22560/22560.jpg', 'Green Tea', 1);

-- Bora Bora
INSERT INTO `products` (name, description, price, image_url, category, is_active) VALUES 
('Bora Bora', '', 14.99, 'Tea Catalogue/22555/22555.jpg', 'Black Tea', 1);

-- Note: This is a subset of products from the backup file.
-- To import all products, use the import_products.php script after fixing the mysqli extension issue.
