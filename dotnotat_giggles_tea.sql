-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 12, 2025 at 05:06 PM
-- Server version: 5.7.44-cll-lve
-- PHP Version: 8.1.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dotnotat_giggles_tea`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(24) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `parent_id` varchar(24) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text,
  `seo_keywords` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `parent_id`, `is_active`, `sort_order`, `seo_title`, `seo_description`, `seo_keywords`, `created_at`, `updated_at`) VALUES
('cat_black_tea', 'Black Tea', 'black-tea', 'Robust and classic black teas, perfect for a strong brew.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:54', '2025-06-19 17:13:54'),
('cat_black_tea_blend', 'Black Tea Blend', 'black-tea-blend', 'Specially blended black teas with unique flavor profiles.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:55', '2025-06-19 17:13:55'),
('cat_fruit_tea_blend', 'Fruit Tea Blend', 'fruit-tea-blend', 'Delicious and aromatic tea blends infused with various fruit flavors.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:55', '2025-06-19 17:13:55'),
('cat_green_tea', 'Green Tea', 'green-tea', 'A diverse selection of green teas, known for their freshness and health benefits.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:54', '2025-06-19 17:13:54'),
('cat_half_fermented_china', 'Half Fermented Tea - China', 'half-fermented-tea-china', 'Unique Oolong teas from China, partially fermented for a complex flavor.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:56', '2025-06-19 17:13:56'),
('cat_herbal_tea_blend', 'Herbal Tea Blend', 'herbal-tea-blend', 'Another collection of blended herbal infusions, focusing on specific wellness aspects.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:56', '2025-06-19 17:13:56'),
('cat_herb_tea', 'Herb Tea', 'herb-tea', 'Pure herbal infusions, focusing on single herb varieties like peppermint or chamomile.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:57', '2025-06-19 17:13:57'),
('cat_herb_tea_blend', 'Herb Tea Blend', 'herb-tea-blend', 'Blended herbal infusions for various purposes, from soothing to invigorating.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:56', '2025-06-19 17:13:56'),
('cat_rooibos_tea', 'Rooibos Tea', 'rooibos-tea', 'Naturally caffeine-free herbal teas from South Africa, known for their earthy and sweet notes.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:55', '2025-06-19 17:13:55'),
('cat_tea_bag_mixbox', 'Tea Bag Mixbox', 'tea-bag-mixbox', 'Various assortments of tea bags for different preferences.', NULL, NULL, 1, 0, NULL, NULL, NULL, '2025-06-19 17:13:53', '2025-06-19 17:13:53');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address_id` int(11) DEFAULT NULL,
  `billing_address_id` int(11) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `cost_per_item` decimal(10,2) DEFAULT NULL COMMENT 'The cost to the business for this product',
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `track_quantity` tinyint(1) NOT NULL DEFAULT '0',
  `quantity` int(11) NOT NULL DEFAULT '0',
  `weight` decimal(10,2) DEFAULT NULL COMMENT 'Weight in grams',
  `weight_unit` enum('g','kg','oz','lb') NOT NULL DEFAULT 'g',
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_gift_card` tinyint(1) NOT NULL DEFAULT '0',
  `requires_shipping` tinyint(1) NOT NULL DEFAULT '1',
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text,
  `category_id` varchar(24) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `compare_at_price`, `cost_per_item`, `sku`, `barcode`, `track_quantity`, `quantity`, `weight`, `weight_unit`, `status`, `is_featured`, `is_gift_card`, `requires_shipping`, `seo_title`, `seo_description`, `category_id`, `created_at`, `updated_at`) VALUES
(1, 'No 1 Fruit & Classic', 'no-1-fruit-classic', 'A delightful mix of fruity and classic tea bags.', 23.50, 28.20, NULL, 'N1F&C-1202', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_tea_bag_mixbox', '2025-06-19 17:13:57', '2025-06-19 17:13:57'),
(2, 'No 2 Fruit & Exotic', 'no-2-fruit-exotic', 'Explore a world of vibrant and unusual flavors.', 18.75, 22.50, NULL, 'N2F&E-8978', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_tea_bag_mixbox', '2025-06-19 17:13:58', '2025-06-19 17:13:58'),
(3, 'No 3 Herbal & Fruit', 'no-3-herbal-fruit', 'A soothing collection of herbal and fruit-infused tea bags.', 31.25, 37.50, NULL, 'N3H&F-1418', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_tea_bag_mixbox', '2025-06-19 17:14:00', '2025-06-19 17:14:00'),
(4, 'No 4 Green & Fresh', 'no-4-green-fresh', 'Rejuvenate your senses with this crisp selection.', 15.99, 19.19, NULL, 'N4G&F-9288', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_tea_bag_mixbox', '2025-06-19 17:14:01', '2025-06-19 17:14:01'),
(5, 'No 5 Black & Beauties', 'no-5-black-beauties', 'Indulge in rich and robust flavors.', 28.00, 33.60, NULL, 'N5B&B-1186', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_tea_bag_mixbox', '2025-06-19 17:14:02', '2025-06-19 17:14:02'),
(6, 'No 6 Black & Pure', 'no-6-black-pure', 'Experience the unadulterated essence of pure black tea.', 12.50, 15.00, NULL, 'N6B&P-6895', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_tea_bag_mixbox', '2025-06-19 17:14:04', '2025-06-19 17:14:04'),
(7, 'No 7 Pure & Clear', 'no-7-pure-clear', 'A gentle and clarifying blend of teas.', 20.10, 24.12, NULL, 'N7P&C-7847', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_tea_bag_mixbox', '2025-06-19 17:14:05', '2025-06-19 17:14:05'),
(8, 'No 8 Best of Xmas', 'no-8-best-of-xmas', 'Celebrate the festive season with special Christmas tea.', 34.00, 40.80, NULL, 'N8BOX-6711', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_tea_bag_mixbox', '2025-06-19 17:14:06', '2025-06-19 17:14:06'),
(9, 'Japan Sencha Fukujyu', 'japan-sencha-fukujyu', 'Premium Sencha Fukujyu green tea with rich umami.', 27.50, 33.00, NULL, 'JSF-3450', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:07', '2025-06-19 17:14:07'),
(10, 'Sencha Lemon', 'sencha-lemon', 'Refreshing Sencha with bright lemon notes.', 14.25, 17.10, NULL, 'SL-7523', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:09', '2025-06-19 17:14:09'),
(11, 'Sencha Orange', 'sencha-orange', 'Zesty orange flavor complements the fresh Sencha.', 15.75, 18.90, NULL, 'SO-4881', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:10', '2025-06-19 17:14:10'),
(12, 'Sencha Peach', 'sencha-peach', 'Juicy peach flavor enhances the green tea.', 16.50, 19.80, NULL, 'SP-7503', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:12', '2025-06-19 17:14:12'),
(13, 'Sencha Vanilla', 'sencha-vanilla', 'Creamy vanilla softens the green tea astringency.', 17.25, 20.70, NULL, 'SV-3671', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:14', '2025-06-19 17:14:14'),
(14, 'Sencha Cherry', 'sencha-cherry', 'Sweet cherry notes with fresh green tea.', 18.00, 21.60, NULL, 'SC-6077', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:15', '2025-06-19 17:14:15'),
(15, 'Sencha Mint', 'sencha-mint', 'Cooling mint refreshes the green tea.', 16.75, 20.10, NULL, 'SM-7782', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:17', '2025-06-19 17:14:17'),
(16, 'Sencha Ginger', 'sencha-ginger', 'Warming ginger spice with green tea.', 17.50, 21.00, NULL, 'SG-9694', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:18', '2025-06-19 17:14:18'),
(17, 'Sencha Jasmine', 'sencha-jasmine', 'Fragrant jasmine flowers scent the green tea.', 19.25, 23.10, NULL, 'SJ-5625', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:20', '2025-06-19 17:14:20'),
(18, 'Sencha Raspberry', 'sencha-raspberry', 'Tart raspberry complements the grassy Sencha.', 18.50, 22.20, NULL, 'SR-2300', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_green_tea', '2025-06-19 17:14:22', '2025-06-19 17:14:22'),
(19, 'Earl Grey', 'earl-grey', 'Classic black tea with bergamot oil.', 12.99, 15.59, NULL, 'EG-6831', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea', '2025-06-19 17:14:23', '2025-06-19 17:14:23'),
(20, 'English Breakfast', 'english-breakfast', 'Robust blend perfect with milk.', 11.99, 14.39, NULL, 'EB-9128', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea', '2025-06-19 17:14:25', '2025-06-19 17:14:25'),
(21, 'Chai Spice', 'chai-spice', 'Warming spices in a black tea base.', 13.50, 16.20, NULL, 'CS-5158', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea', '2025-06-19 17:14:26', '2025-06-19 17:14:26'),
(22, 'Darjeeling', 'darjeeling', 'The champagne of teas with muscatel notes.', 15.75, 18.90, NULL, 'D-1598', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea', '2025-06-19 17:14:28', '2025-06-19 17:14:28'),
(23, 'Assam', 'assam', 'Malty and bold Indian black tea.', 14.25, 17.10, NULL, 'A-5762', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea', '2025-06-19 17:14:29', '2025-06-19 17:14:29'),
(24, 'Ceylon', 'ceylon', 'Bright and citrusy Sri Lankan tea.', 13.99, 16.79, NULL, 'C-3371', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea', '2025-06-19 17:14:31', '2025-06-19 17:14:31'),
(25, 'Lapsang Souchong', 'lapsang-souchong', 'Smoky Chinese black tea.', 16.50, 19.80, NULL, 'LS-8975', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea', '2025-06-19 17:14:32', '2025-06-19 17:14:32'),
(26, 'Russian Caravan', 'russian-caravan', 'Smoky blend with a hint of Lapsang.', 17.25, 20.70, NULL, 'RC-4883', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea', '2025-06-19 17:14:34', '2025-06-19 17:14:34'),
(27, 'Masala Chai', 'masala-chai', 'Traditional Indian spiced tea blend.', 14.99, 17.99, NULL, 'MC-8514', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea_blend', '2025-06-19 17:14:35', '2025-06-19 17:14:35'),
(28, 'Vanilla Chai', 'vanilla-chai', 'Creamy vanilla with spiced black tea.', 15.50, 18.60, NULL, 'VC-5353', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea_blend', '2025-06-19 17:14:37', '2025-06-19 17:14:37'),
(29, 'Chocolate Chai', 'chocolate-chai', 'Decadent chocolate meets spiced tea.', 16.25, 19.50, NULL, 'CC-9919', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea_blend', '2025-06-19 17:14:38', '2025-06-19 17:14:38'),
(30, 'Earl Grey Cream', 'earl-grey-cream', 'Earl Grey with vanilla cream.', 15.99, 19.19, NULL, 'EGC-6015', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea_blend', '2025-06-19 17:14:40', '2025-06-19 17:14:40'),
(31, 'Lady Grey', 'lady-grey', 'Earl Grey with citrus peel and lavender.', 14.75, 17.70, NULL, 'LG-8928', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea_blend', '2025-06-19 17:14:42', '2025-06-19 17:14:42'),
(32, 'Breakfast Blend', 'breakfast-blend', 'Robust blend for a morning boost.', 13.25, 15.90, NULL, 'BB-5343', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_black_tea_blend', '2025-06-19 17:14:43', '2025-06-19 17:14:43'),
(33, 'Pure Rooibos', 'pure-rooibos', 'Naturally sweet and caffeine-free.', 10.99, 13.19, NULL, 'PR-4543', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_rooibos_tea', '2025-06-19 17:14:45', '2025-06-19 17:14:45'),
(34, 'Vanilla Rooibos', 'vanilla-rooibos', 'Creamy vanilla enhances natural sweetness.', 12.50, 15.00, NULL, 'VR-6275', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_rooibos_tea', '2025-06-19 17:14:46', '2025-06-19 17:14:46'),
(35, 'Chai Rooibos', 'chai-rooibos', 'Spiced rooibos blend.', 13.25, 15.90, NULL, 'CR-5252', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_rooibos_tea', '2025-06-19 17:14:48', '2025-06-19 17:14:48'),
(36, 'Rooibos Caramel', 'rooibos-caramel', 'Sweet caramel notes with rooibos.', 13.99, 16.79, NULL, 'RC-5308', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_rooibos_tea', '2025-06-19 17:14:49', '2025-06-19 17:14:49'),
(37, 'Rooibos Orange', 'rooibos-orange', 'Citrusy twist on classic rooibos.', 12.75, 15.30, NULL, 'RO-2020', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_rooibos_tea', '2025-06-19 17:14:51', '2025-06-19 17:14:51'),
(38, 'Berry Medley', 'berry-medley', 'Mixed berries in a caffeine-free infusion.', 11.99, 14.39, NULL, 'BM-8798', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_fruit_tea_blend', '2025-06-19 17:14:52', '2025-06-19 17:14:52'),
(39, 'Tropical Paradise', 'tropical-paradise', 'Mango, pineapple, and passionfruit blend.', 12.50, 15.00, NULL, 'TP-7103', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_fruit_tea_blend', '2025-06-19 17:14:54', '2025-06-19 17:14:54'),
(40, 'Citrus Sunrise', 'citrus-sunrise', 'Orange, lemon, and grapefruit blend.', 11.75, 14.10, NULL, 'CS-4944', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_fruit_tea_blend', '2025-06-19 17:14:55', '2025-06-19 17:14:55'),
(41, 'Summer Fruits', 'summer-fruits', 'Strawberry, raspberry, and blackcurrant.', 12.25, 14.70, NULL, 'SF-4474', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_fruit_tea_blend', '2025-06-19 17:14:57', '2025-06-19 17:14:57'),
(42, 'Winter Spice', 'winter-spice', 'Apple, cinnamon, and seasonal spices.', 13.50, 16.20, NULL, 'WS-4854', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_fruit_tea_blend', '2025-06-19 17:14:59', '2025-06-19 17:14:59'),
(43, 'Forest Fruits', 'forest-fruits', 'Blackberry, blueberry, and elderberry.', 12.75, 15.30, NULL, 'FF-3896', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_fruit_tea_blend', '2025-06-19 17:15:01', '2025-06-19 17:15:01'),
(44, 'Peach Passion', 'peach-passion', 'Juicy peach with passionfruit.', 12.99, 15.59, NULL, 'PP-5327', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_fruit_tea_blend', '2025-06-19 17:15:02', '2025-06-19 17:15:02'),
(45, 'Tie Guan Yin', 'tie-guan-yin', 'Classic Chinese oolong with floral notes.', 22.99, 27.59, NULL, 'TGY-2219', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_half_fermented_china', '2025-06-19 17:15:05', '2025-06-19 17:15:05'),
(46, 'Da Hong Pao', 'da-hong-pao', 'Rare roasted oolong with mineral notes.', 35.50, 42.60, NULL, 'DHP-7911', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_half_fermented_china', '2025-06-19 17:15:07', '2025-06-19 17:15:07'),
(47, 'Dong Ding', 'dong-ding', 'Taiwanese oolong with fruity notes.', 28.75, 34.50, NULL, 'DD-5589', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_half_fermented_china', '2025-06-19 17:15:09', '2025-06-19 17:15:09'),
(48, 'Milk Oolong', 'milk-oolong', 'Creamy, buttery oolong tea.', 24.99, 29.99, NULL, 'MO-4527', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_half_fermented_china', '2025-06-19 17:15:11', '2025-06-19 17:15:11'),
(49, 'Oriental Beauty', 'oriental-beauty', 'Honeyed oolong with fruity notes.', 32.50, 39.00, NULL, 'OB-5929', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_half_fermented_china', '2025-06-19 17:15:12', '2025-06-19 17:15:12'),
(50, 'Chamomile Citrus', 'chamomile-citrus', 'Soothing chamomile with citrus.', 10.99, 13.19, NULL, 'CC-2985', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_herb_tea_blend', '2025-06-19 17:15:14', '2025-06-19 17:15:14'),
(51, 'Mint Medley', 'mint-medley', 'Peppermint and spearmint blend.', 9.99, 11.99, NULL, 'MM-6251', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_herb_tea_blend', '2025-06-19 17:15:15', '2025-06-19 17:15:15'),
(52, 'Lemon Ginger', 'lemon-ginger', 'Zesty lemon with spicy ginger.', 11.50, 13.80, NULL, 'LG-1748', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_herb_tea_blend', '2025-06-19 17:15:17', '2025-06-19 17:15:17'),
(53, 'Hibiscus Rose', 'hibiscus-rose', 'Tart hibiscus with rose petals.', 10.75, 12.90, NULL, 'HR-4596', NULL, 0, 0, NULL, 'g', 'active', 0, 0, 1, NULL, NULL, 'cat_herb_tea_blend', '2025-06-19 17:15:19', '2025-06-19 17:15:19');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL COMMENT 'References products.id',
  `url` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `position` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `url`, `alt_text`, `width`, `height`, `is_primary`, `position`, `created_at`, `updated_at`) VALUES
(1, 1, 'src/assets/1704.jpg', 'No 1 Fruit & Classic - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:19', '2025-06-19 16:15:19'),
(2, 1, 'src/assets/1704_1706_1710.jpg', 'No 1 Fruit & Classic - Image 2', NULL, NULL, 0, 2, '2025-06-19 16:15:19', '2025-06-19 16:15:19'),
(3, 2, 'src/assets/1705.jpg', 'No 2 Fruit & Exotic - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:21', '2025-06-19 16:15:21'),
(4, 2, 'src/assets/1705_2.jpg', 'No 2 Fruit & Exotic - Image 2', NULL, NULL, 0, 2, '2025-06-19 16:15:21', '2025-06-19 16:15:21'),
(5, 3, 'src/assets/1706.jpg', 'No 3 Herbal & Fruit - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:22', '2025-06-19 16:15:22'),
(6, 4, 'src/assets/1707.jpg', 'No 4 Green & Fresh - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:23', '2025-06-19 16:15:23'),
(7, 4, 'src/assets/1707_1711_1705.jpg', 'No 4 Green & Fresh - Image 2', NULL, NULL, 0, 2, '2025-06-19 16:15:24', '2025-06-19 16:15:24'),
(8, 5, 'src/assets/1708.jpg', 'No 5 Black & Beauties - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:25', '2025-06-19 16:15:25'),
(9, 6, 'src/assets/1710.jpg', 'No 6 Black & Pure - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:26', '2025-06-19 16:15:26'),
(10, 7, 'src/assets/1711.jpg', 'No 7 Pure & Clear - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:28', '2025-06-19 16:15:28'),
(11, 8, 'src/assets/1712_1.jpg', 'No 8 Best of Xmas - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:29', '2025-06-19 16:15:29'),
(12, 9, 'src/assets/21042.jpg', 'Japan Sencha Fukujyu - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:30', '2025-06-19 16:15:30'),
(13, 9, 'src/assets/21042-g50.jpg', 'Japan Sencha Fukujyu - Image 2', NULL, NULL, 0, 2, '2025-06-19 16:15:30', '2025-06-19 16:15:30'),
(14, 9, 'src/assets/21042-g150.jpg', 'Japan Sencha Fukujyu - Image 3', NULL, NULL, 0, 3, '2025-06-19 16:15:31', '2025-06-19 16:15:31'),
(15, 10, 'src/assets/21043.jpg', 'Sencha Lemon - Image 1', NULL, NULL, 1, 1, '2025-06-19 16:15:32', '2025-06-19 16:15:32'),
(16, 10, 'src/assets/21043-g50.jpg', 'Sencha Lemon - Image 2', NULL, NULL, 0, 2, '2025-06-19 16:15:32', '2025-06-19 16:15:32'),
(17, 1, 'src/assets/1704.jpg', 'No 1 Fruit & Classic - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:29', '2025-06-19 17:10:29'),
(18, 1, 'src/assets/1704_1706_1710.jpg', 'No 1 Fruit & Classic - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:29', '2025-06-19 17:10:29'),
(19, 2, 'src/assets/1705.jpg', 'No 2 Fruit & Exotic - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:31', '2025-06-19 17:10:31'),
(20, 2, 'src/assets/1705_2.jpg', 'No 2 Fruit & Exotic - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:31', '2025-06-19 17:10:31'),
(21, 3, 'src/assets/1706.jpg', 'No 3 Herbal & Fruit - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:32', '2025-06-19 17:10:32'),
(22, 4, 'src/assets/1707.jpg', 'No 4 Green & Fresh - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:33', '2025-06-19 17:10:33'),
(23, 4, 'src/assets/1707_1711_1705.jpg', 'No 4 Green & Fresh - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:33', '2025-06-19 17:10:33'),
(24, 5, 'src/assets/1708.jpg', 'No 5 Black & Beauties - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:34', '2025-06-19 17:10:34'),
(25, 6, 'src/assets/1710.jpg', 'No 6 Black & Pure - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:35', '2025-06-19 17:10:35'),
(26, 7, 'src/assets/1711.jpg', 'No 7 Pure & Clear - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:36', '2025-06-19 17:10:36'),
(27, 8, 'src/assets/1712_1.jpg', 'No 8 Best of Xmas - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:38', '2025-06-19 17:10:38'),
(28, 9, 'src/assets/21042.jpg', 'Japan Sencha Fukujyu - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:39', '2025-06-19 17:10:39'),
(29, 9, 'src/assets/21042-g50.jpg', 'Japan Sencha Fukujyu - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:39', '2025-06-19 17:10:39'),
(30, 9, 'src/assets/21042-g150.jpg', 'Japan Sencha Fukujyu - Image 3', NULL, NULL, 0, 3, '2025-06-19 17:10:39', '2025-06-19 17:10:39'),
(31, 10, 'src/assets/21043.jpg', 'Sencha Lemon - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:40', '2025-06-19 17:10:40'),
(32, 10, 'src/assets/21043-g50.jpg', 'Sencha Lemon - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:41', '2025-06-19 17:10:41'),
(33, 11, 'src/assets/21044.jpg', 'Sencha Orange - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:42', '2025-06-19 17:10:42'),
(34, 11, 'src/assets/21044-g50.jpg', 'Sencha Orange - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:42', '2025-06-19 17:10:42'),
(35, 12, 'src/assets/21045.jpg', 'Sencha Peach - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:43', '2025-06-19 17:10:43'),
(36, 12, 'src/assets/21045-g50.jpg', 'Sencha Peach - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:43', '2025-06-19 17:10:43'),
(37, 13, 'src/assets/21046.jpg', 'Sencha Vanilla - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:45', '2025-06-19 17:10:45'),
(38, 13, 'src/assets/21046-g50.jpg', 'Sencha Vanilla - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:45', '2025-06-19 17:10:45'),
(39, 14, 'src/assets/21047.jpg', 'Sencha Cherry - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:46', '2025-06-19 17:10:46'),
(40, 14, 'src/assets/21047-g50.jpg', 'Sencha Cherry - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:46', '2025-06-19 17:10:46'),
(41, 15, 'src/assets/21048.jpg', 'Sencha Mint - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:47', '2025-06-19 17:10:47'),
(42, 15, 'src/assets/21048-g50.jpg', 'Sencha Mint - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:48', '2025-06-19 17:10:48'),
(43, 16, 'src/assets/21049.jpg', 'Sencha Ginger - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:49', '2025-06-19 17:10:49'),
(44, 16, 'src/assets/21049-g50.jpg', 'Sencha Ginger - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:49', '2025-06-19 17:10:49'),
(45, 17, 'src/assets/21050.jpg', 'Sencha Jasmine - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:50', '2025-06-19 17:10:50'),
(46, 17, 'src/assets/21050-g50.jpg', 'Sencha Jasmine - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:50', '2025-06-19 17:10:50'),
(47, 18, 'src/assets/21051.jpg', 'Sencha Raspberry - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:51', '2025-06-19 17:10:51'),
(48, 18, 'src/assets/21051-g50.jpg', 'Sencha Raspberry - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:52', '2025-06-19 17:10:52'),
(49, 19, 'src/assets/31012.jpg', 'Earl Grey - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:53', '2025-06-19 17:10:53'),
(50, 19, 'src/assets/31012-g50.jpg', 'Earl Grey - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:53', '2025-06-19 17:10:53'),
(51, 20, 'src/assets/31013.jpg', 'English Breakfast - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:54', '2025-06-19 17:10:54'),
(52, 20, 'src/assets/31013-g50.jpg', 'English Breakfast - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:55', '2025-06-19 17:10:55'),
(53, 21, 'src/assets/31014.jpg', 'Chai Spice - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:56', '2025-06-19 17:10:56'),
(54, 21, 'src/assets/31014-g50.jpg', 'Chai Spice - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:56', '2025-06-19 17:10:56'),
(55, 22, 'src/assets/31015.jpg', 'Darjeeling - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:57', '2025-06-19 17:10:57'),
(56, 22, 'src/assets/31015-g50.jpg', 'Darjeeling - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:57', '2025-06-19 17:10:57'),
(57, 23, 'src/assets/31016.jpg', 'Assam - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:10:59', '2025-06-19 17:10:59'),
(58, 23, 'src/assets/31016-g50.jpg', 'Assam - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:10:59', '2025-06-19 17:10:59'),
(59, 24, 'src/assets/31017.jpg', 'Ceylon - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:00', '2025-06-19 17:11:00'),
(60, 24, 'src/assets/31017-g50.jpg', 'Ceylon - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:00', '2025-06-19 17:11:00'),
(61, 25, 'src/assets/31018.jpg', 'Lapsang Souchong - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:01', '2025-06-19 17:11:01'),
(62, 25, 'src/assets/31018-g50.jpg', 'Lapsang Souchong - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:02', '2025-06-19 17:11:02'),
(63, 26, 'src/assets/31019.jpg', 'Russian Caravan - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:03', '2025-06-19 17:11:03'),
(64, 26, 'src/assets/31019-g50.jpg', 'Russian Caravan - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:03', '2025-06-19 17:11:03'),
(65, 27, 'src/assets/32012.jpg', 'Masala Chai - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:05', '2025-06-19 17:11:05'),
(66, 27, 'src/assets/32012-g50.jpg', 'Masala Chai - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:05', '2025-06-19 17:11:05'),
(67, 28, 'src/assets/32013.jpg', 'Vanilla Chai - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:06', '2025-06-19 17:11:06'),
(68, 28, 'src/assets/32013-g50.jpg', 'Vanilla Chai - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:07', '2025-06-19 17:11:07'),
(69, 29, 'src/assets/32014.jpg', 'Chocolate Chai - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:08', '2025-06-19 17:11:08'),
(70, 29, 'src/assets/32014-g50.jpg', 'Chocolate Chai - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:08', '2025-06-19 17:11:08'),
(71, 30, 'src/assets/32015.jpg', 'Earl Grey Cream - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:09', '2025-06-19 17:11:09'),
(72, 30, 'src/assets/32015-g50.jpg', 'Earl Grey Cream - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:10', '2025-06-19 17:11:10'),
(73, 31, 'src/assets/32016.jpg', 'Lady Grey - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:11', '2025-06-19 17:11:11'),
(74, 31, 'src/assets/32016-g50.jpg', 'Lady Grey - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:11', '2025-06-19 17:11:11'),
(75, 32, 'src/assets/32017.jpg', 'Breakfast Blend - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:13', '2025-06-19 17:11:13'),
(76, 32, 'src/assets/32017-g50.jpg', 'Breakfast Blend - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:13', '2025-06-19 17:11:13'),
(77, 33, 'src/assets/41012.jpg', 'Pure Rooibos - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:14', '2025-06-19 17:11:14'),
(78, 33, 'src/assets/41012-g50.jpg', 'Pure Rooibos - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:15', '2025-06-19 17:11:15'),
(79, 34, 'src/assets/41013.jpg', 'Vanilla Rooibos - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:16', '2025-06-19 17:11:16'),
(80, 34, 'src/assets/41013-g50.jpg', 'Vanilla Rooibos - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:16', '2025-06-19 17:11:16'),
(81, 35, 'src/assets/41014.jpg', 'Chai Rooibos - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:17', '2025-06-19 17:11:17'),
(82, 35, 'src/assets/41014-g50.jpg', 'Chai Rooibos - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:18', '2025-06-19 17:11:18'),
(83, 36, 'src/assets/41015.jpg', 'Rooibos Caramel - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:19', '2025-06-19 17:11:19'),
(84, 36, 'src/assets/41015-g50.jpg', 'Rooibos Caramel - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:19', '2025-06-19 17:11:19'),
(85, 37, 'src/assets/41016.jpg', 'Rooibos Orange - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:20', '2025-06-19 17:11:20'),
(86, 37, 'src/assets/41016-g50.jpg', 'Rooibos Orange - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:21', '2025-06-19 17:11:21'),
(87, 38, 'src/assets/51012.jpg', 'Berry Medley - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:22', '2025-06-19 17:11:22'),
(88, 38, 'src/assets/51012-g50.jpg', 'Berry Medley - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:22', '2025-06-19 17:11:22'),
(89, 39, 'src/assets/51013.jpg', 'Tropical Paradise - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:24', '2025-06-19 17:11:24'),
(90, 39, 'src/assets/51013-g50.jpg', 'Tropical Paradise - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:24', '2025-06-19 17:11:24'),
(91, 40, 'src/assets/51014.jpg', 'Citrus Sunrise - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:25', '2025-06-19 17:11:25'),
(92, 40, 'src/assets/51014-g50.jpg', 'Citrus Sunrise - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:26', '2025-06-19 17:11:26'),
(93, 41, 'src/assets/51015.jpg', 'Summer Fruits - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:27', '2025-06-19 17:11:27'),
(94, 41, 'src/assets/51015-g50.jpg', 'Summer Fruits - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:27', '2025-06-19 17:11:27'),
(95, 42, 'src/assets/51016.jpg', 'Winter Spice - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:29', '2025-06-19 17:11:29'),
(96, 42, 'src/assets/51016-g50.jpg', 'Winter Spice - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:29', '2025-06-19 17:11:29'),
(97, 43, 'src/assets/51017.jpg', 'Forest Fruits - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:31', '2025-06-19 17:11:31'),
(98, 43, 'src/assets/51017-g50.jpg', 'Forest Fruits - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:31', '2025-06-19 17:11:31'),
(99, 44, 'src/assets/51018.jpg', 'Peach Passion - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:33', '2025-06-19 17:11:33'),
(100, 44, 'src/assets/51018-g50.jpg', 'Peach Passion - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:33', '2025-06-19 17:11:33'),
(101, 45, 'src/assets/61012.jpg', 'Tie Guan Yin - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:35', '2025-06-19 17:11:35'),
(102, 45, 'src/assets/61012-g50.jpg', 'Tie Guan Yin - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:35', '2025-06-19 17:11:35'),
(103, 46, 'src/assets/61013.jpg', 'Da Hong Pao - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:37', '2025-06-19 17:11:37'),
(104, 46, 'src/assets/61013-g50.jpg', 'Da Hong Pao - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:37', '2025-06-19 17:11:37'),
(105, 47, 'src/assets/61014.jpg', 'Dong Ding - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:39', '2025-06-19 17:11:39'),
(106, 47, 'src/assets/61014-g50.jpg', 'Dong Ding - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:40', '2025-06-19 17:11:40'),
(107, 48, 'src/assets/61015.jpg', 'Milk Oolong - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:41', '2025-06-19 17:11:41'),
(108, 48, 'src/assets/61015-g50.jpg', 'Milk Oolong - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:42', '2025-06-19 17:11:42'),
(109, 49, 'src/assets/61016.jpg', 'Oriental Beauty - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:44', '2025-06-19 17:11:44'),
(110, 49, 'src/assets/61016-g50.jpg', 'Oriental Beauty - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:44', '2025-06-19 17:11:44'),
(111, 50, 'src/assets/71012.jpg', 'Chamomile Citrus - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:45', '2025-06-19 17:11:45'),
(112, 50, 'src/assets/71012-g50.jpg', 'Chamomile Citrus - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:45', '2025-06-19 17:11:45'),
(113, 51, 'src/assets/71013.jpg', 'Mint Medley - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:47', '2025-06-19 17:11:47'),
(114, 51, 'src/assets/71013-g50.jpg', 'Mint Medley - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:47', '2025-06-19 17:11:47'),
(115, 52, 'src/assets/71014.jpg', 'Lemon Ginger - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:48', '2025-06-19 17:11:48'),
(116, 52, 'src/assets/71014-g50.jpg', 'Lemon Ginger - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:49', '2025-06-19 17:11:49'),
(117, 53, 'src/assets/71015.jpg', 'Hibiscus Rose - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:11:50', '2025-06-19 17:11:50'),
(118, 53, 'src/assets/71015-g50.jpg', 'Hibiscus Rose - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:11:50', '2025-06-19 17:11:50'),
(119, 1, 'src/assets/1704.jpg', 'No 1 Fruit & Classic - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:13:57', '2025-06-19 17:13:57'),
(120, 1, 'src/assets/1704_1706_1710.jpg', 'No 1 Fruit & Classic - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:13:58', '2025-06-19 17:13:58'),
(121, 2, 'src/assets/1705.jpg', 'No 2 Fruit & Exotic - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:13:59', '2025-06-19 17:13:59'),
(122, 2, 'src/assets/1705_2.jpg', 'No 2 Fruit & Exotic - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:13:59', '2025-06-19 17:13:59'),
(123, 3, 'src/assets/1706.jpg', 'No 3 Herbal & Fruit - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:00', '2025-06-19 17:14:00'),
(124, 4, 'src/assets/1707.jpg', 'No 4 Green & Fresh - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:02', '2025-06-19 17:14:02'),
(125, 4, 'src/assets/1707_1711_1705.jpg', 'No 4 Green & Fresh - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:02', '2025-06-19 17:14:02'),
(126, 5, 'src/assets/1708.jpg', 'No 5 Black & Beauties - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:03', '2025-06-19 17:14:03'),
(127, 6, 'src/assets/1710.jpg', 'No 6 Black & Pure - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:05', '2025-06-19 17:14:05'),
(128, 7, 'src/assets/1711.jpg', 'No 7 Pure & Clear - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:06', '2025-06-19 17:14:06'),
(129, 8, 'src/assets/1712_1.jpg', 'No 8 Best of Xmas - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:07', '2025-06-19 17:14:07'),
(130, 9, 'src/assets/21042.jpg', 'Japan Sencha Fukujyu - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:08', '2025-06-19 17:14:08'),
(131, 9, 'src/assets/21042-g50.jpg', 'Japan Sencha Fukujyu - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:08', '2025-06-19 17:14:08'),
(132, 9, 'src/assets/21042-g150.jpg', 'Japan Sencha Fukujyu - Image 3', NULL, NULL, 0, 3, '2025-06-19 17:14:09', '2025-06-19 17:14:09'),
(133, 10, 'src/assets/21043.jpg', 'Sencha Lemon - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:10', '2025-06-19 17:14:10'),
(134, 10, 'src/assets/21043-g50.jpg', 'Sencha Lemon - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:10', '2025-06-19 17:14:10'),
(135, 11, 'src/assets/21044.jpg', 'Sencha Orange - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:11', '2025-06-19 17:14:11'),
(136, 11, 'src/assets/21044-g50.jpg', 'Sencha Orange - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:12', '2025-06-19 17:14:12'),
(137, 12, 'src/assets/21045.jpg', 'Sencha Peach - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:13', '2025-06-19 17:14:13'),
(138, 12, 'src/assets/21045-g50.jpg', 'Sencha Peach - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:13', '2025-06-19 17:14:13'),
(139, 13, 'src/assets/21046.jpg', 'Sencha Vanilla - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:15', '2025-06-19 17:14:15'),
(140, 13, 'src/assets/21046-g50.jpg', 'Sencha Vanilla - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:15', '2025-06-19 17:14:15'),
(141, 14, 'src/assets/21047.jpg', 'Sencha Cherry - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:16', '2025-06-19 17:14:16'),
(142, 14, 'src/assets/21047-g50.jpg', 'Sencha Cherry - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:17', '2025-06-19 17:14:17'),
(143, 15, 'src/assets/21048.jpg', 'Sencha Mint - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:18', '2025-06-19 17:14:18'),
(144, 15, 'src/assets/21048-g50.jpg', 'Sencha Mint - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:18', '2025-06-19 17:14:18'),
(145, 16, 'src/assets/21049.jpg', 'Sencha Ginger - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:19', '2025-06-19 17:14:19'),
(146, 16, 'src/assets/21049-g50.jpg', 'Sencha Ginger - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:20', '2025-06-19 17:14:20'),
(147, 17, 'src/assets/21050.jpg', 'Sencha Jasmine - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:21', '2025-06-19 17:14:21'),
(148, 17, 'src/assets/21050-g50.jpg', 'Sencha Jasmine - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:21', '2025-06-19 17:14:21'),
(149, 18, 'src/assets/21051.jpg', 'Sencha Raspberry - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:22', '2025-06-19 17:14:22'),
(150, 18, 'src/assets/21051-g50.jpg', 'Sencha Raspberry - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:23', '2025-06-19 17:14:23'),
(151, 19, 'src/assets/31012.jpg', 'Earl Grey - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:24', '2025-06-19 17:14:24'),
(152, 19, 'src/assets/31012-g50.jpg', 'Earl Grey - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:24', '2025-06-19 17:14:24'),
(153, 20, 'src/assets/31013.jpg', 'English Breakfast - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:25', '2025-06-19 17:14:25'),
(154, 20, 'src/assets/31013-g50.jpg', 'English Breakfast - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:26', '2025-06-19 17:14:26'),
(155, 21, 'src/assets/31014.jpg', 'Chai Spice - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:27', '2025-06-19 17:14:27'),
(156, 21, 'src/assets/31014-g50.jpg', 'Chai Spice - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:27', '2025-06-19 17:14:27'),
(157, 22, 'src/assets/31015.jpg', 'Darjeeling - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:28', '2025-06-19 17:14:28'),
(158, 22, 'src/assets/31015-g50.jpg', 'Darjeeling - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:29', '2025-06-19 17:14:29'),
(159, 23, 'src/assets/31016.jpg', 'Assam - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:30', '2025-06-19 17:14:30'),
(160, 23, 'src/assets/31016-g50.jpg', 'Assam - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:30', '2025-06-19 17:14:30'),
(161, 24, 'src/assets/31017.jpg', 'Ceylon - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:31', '2025-06-19 17:14:31'),
(162, 24, 'src/assets/31017-g50.jpg', 'Ceylon - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:32', '2025-06-19 17:14:32'),
(163, 25, 'src/assets/31018.jpg', 'Lapsang Souchong - Image 1', NULL, NULL, 1, 1, '0000-00-00 00:00:00', '2025-06-19 17:14:33'),
(164, 25, 'src/assets/31018-g50.jpg', 'Lapsang Souchong - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:33', '2025-06-19 17:14:33'),
(165, 26, 'src/assets/31019.jpg', 'Russian Caravan - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:35', '2025-06-19 17:14:35'),
(166, 26, 'src/assets/31019-g50.jpg', 'Russian Caravan - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:35', '2025-06-19 17:14:35'),
(167, 27, 'src/assets/32012.jpg', 'Masala Chai - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:36', '2025-06-19 17:14:36'),
(168, 27, 'src/assets/32012-g50.jpg', 'Masala Chai - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:37', '2025-06-19 17:14:37'),
(169, 28, 'src/assets/32013.jpg', 'Vanilla Chai - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:38', '2025-06-19 17:14:38'),
(170, 28, 'src/assets/32013-g50.jpg', 'Vanilla Chai - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:38', '2025-06-19 17:14:38'),
(171, 29, 'src/assets/32014.jpg', 'Chocolate Chai - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:39', '2025-06-19 17:14:39'),
(172, 29, 'src/assets/32014-g50.jpg', 'Chocolate Chai - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:40', '2025-06-19 17:14:40'),
(173, 30, 'src/assets/32015.jpg', 'Earl Grey Cream - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:41', '2025-06-19 17:14:41'),
(174, 30, 'src/assets/32015-g50.jpg', 'Earl Grey Cream - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:41', '2025-06-19 17:14:41'),
(175, 31, 'src/assets/32016.jpg', 'Lady Grey - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:43', '2025-06-19 17:14:43'),
(176, 31, 'src/assets/32016-g50.jpg', 'Lady Grey - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:43', '2025-06-19 17:14:43'),
(177, 32, 'src/assets/32017.jpg', 'Breakfast Blend - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:44', '2025-06-19 17:14:44'),
(178, 32, 'src/assets/32017-g50.jpg', 'Breakfast Blend - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:44', '2025-06-19 17:14:44'),
(179, 33, 'src/assets/41012.jpg', 'Pure Rooibos - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:46', '2025-06-19 17:14:46'),
(180, 33, 'src/assets/41012-g50.jpg', 'Pure Rooibos - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:46', '2025-06-19 17:14:46'),
(181, 34, 'src/assets/41013.jpg', 'Vanilla Rooibos - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:47', '2025-06-19 17:14:47'),
(182, 34, 'src/assets/41013-g50.jpg', 'Vanilla Rooibos - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:47', '2025-06-19 17:14:47'),
(183, 35, 'src/assets/41014.jpg', 'Chai Rooibos - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:49', '2025-06-19 17:14:49'),
(184, 35, 'src/assets/41014-g50.jpg', 'Chai Rooibos - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:49', '2025-06-19 17:14:49'),
(185, 36, 'src/assets/41015.jpg', 'Rooibos Caramel - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:50', '2025-06-19 17:14:50'),
(186, 36, 'src/assets/41015-g50.jpg', 'Rooibos Caramel - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:50', '2025-06-19 17:14:50'),
(187, 37, 'src/assets/41016.jpg', 'Rooibos Orange - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:52', '2025-06-19 17:14:52'),
(188, 37, 'src/assets/41016-g50.jpg', 'Rooibos Orange - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:52', '2025-06-19 17:14:52'),
(189, 38, 'src/assets/51012.jpg', 'Berry Medley - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:53', '2025-06-19 17:14:53'),
(190, 38, 'src/assets/51012-g50.jpg', 'Berry Medley - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:53', '2025-06-19 17:14:53'),
(191, 39, 'src/assets/51013.jpg', 'Tropical Paradise - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:54', '2025-06-19 17:14:54'),
(192, 39, 'src/assets/51013-g50.jpg', 'Tropical Paradise - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:55', '2025-06-19 17:14:55'),
(193, 40, 'src/assets/51014.jpg', 'Citrus Sunrise - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:56', '2025-06-19 17:14:56'),
(194, 40, 'src/assets/51014-g50.jpg', 'Citrus Sunrise - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:56', '2025-06-19 17:14:56'),
(195, 41, 'src/assets/51015.jpg', 'Summer Fruits - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:14:58', '2025-06-19 17:14:58'),
(196, 41, 'src/assets/51015-g50.jpg', 'Summer Fruits - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:14:59', '2025-06-19 17:14:59'),
(197, 42, 'src/assets/51016.jpg', 'Winter Spice - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:00', '2025-06-19 17:15:00'),
(198, 42, 'src/assets/51016-g50.jpg', 'Winter Spice - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:00', '2025-06-19 17:15:00'),
(199, 43, 'src/assets/51017.jpg', 'Forest Fruits - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:01', '2025-06-19 17:15:01'),
(200, 43, 'src/assets/51017-g50.jpg', 'Forest Fruits - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:02', '2025-06-19 17:15:02'),
(201, 44, 'src/assets/51018.jpg', 'Peach Passion - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:04', '2025-06-19 17:15:04'),
(202, 44, 'src/assets/51018-g50.jpg', 'Peach Passion - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:04', '2025-06-19 17:15:04'),
(203, 45, 'src/assets/61012.jpg', 'Tie Guan Yin - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:06', '2025-06-19 17:15:06'),
(204, 45, 'src/assets/61012-g50.jpg', 'Tie Guan Yin - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:06', '2025-06-19 17:15:06'),
(205, 46, 'src/assets/61013.jpg', 'Da Hong Pao - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:08', '2025-06-19 17:15:08'),
(206, 46, 'src/assets/61013-g50.jpg', 'Da Hong Pao - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:08', '2025-06-19 17:15:08'),
(207, 47, 'src/assets/61014.jpg', 'Dong Ding - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:10', '2025-06-19 17:15:10'),
(208, 47, 'src/assets/61014-g50.jpg', 'Dong Ding - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:10', '2025-06-19 17:15:10'),
(209, 48, 'src/assets/61015.jpg', 'Milk Oolong - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:11', '2025-06-19 17:15:11'),
(210, 48, 'src/assets/61015-g50.jpg', 'Milk Oolong - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:12', '2025-06-19 17:15:12'),
(211, 49, 'src/assets/61016.jpg', 'Oriental Beauty - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:13', '2025-06-19 17:15:13'),
(212, 49, 'src/assets/61016-g50.jpg', 'Oriental Beauty - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:14', '2025-06-19 17:15:14'),
(213, 50, 'src/assets/71012.jpg', 'Chamomile Citrus - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:15', '2025-06-19 17:15:15'),
(214, 50, 'src/assets/71012-g50.jpg', 'Chamomile Citrus - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:15', '2025-06-19 17:15:15'),
(215, 51, 'src/assets/71013.jpg', 'Mint Medley - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:16', '2025-06-19 17:15:16'),
(216, 51, 'src/assets/71013-g50.jpg', 'Mint Medley - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:17', '2025-06-19 17:15:17'),
(217, 52, 'src/assets/71014.jpg', 'Lemon Ginger - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:18', '2025-06-19 17:15:18'),
(218, 52, 'src/assets/71014-g50.jpg', 'Lemon Ginger - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:18', '2025-06-19 17:15:18'),
(219, 53, 'src/assets/71015.jpg', 'Hibiscus Rose - Image 1', NULL, NULL, 1, 1, '2025-06-19 17:15:19', '2025-06-19 17:15:19'),
(220, 53, 'src/assets/71015-g50.jpg', 'Hibiscus Rose - Image 2', NULL, NULL, 0, 2, '2025-06-19 17:15:20', '2025-06-19 17:15:20');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` varchar(24) NOT NULL,
  `product_id` int(11) NOT NULL COMMENT 'References products.id',
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `option1` varchar(100) DEFAULT NULL COMMENT 'e.g., Size: Large',
  `option2` varchar(100) DEFAULT NULL COMMENT 'e.g., Color: Red',
  `option3` varchar(100) DEFAULT NULL COMMENT 'Additional variant option',
  `price` decimal(10,2) NOT NULL,
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `cost_per_item` decimal(10,2) DEFAULT NULL COMMENT 'The cost to the business for this variant',
  `quantity` int(11) NOT NULL DEFAULT '0',
  `weight` decimal(10,2) DEFAULT NULL COMMENT 'Weight in grams',
  `weight_unit` enum('g','kg','oz','lb') NOT NULL DEFAULT 'g',
  `requires_shipping` tinyint(1) NOT NULL DEFAULT '1',
  `taxable` tinyint(1) NOT NULL DEFAULT '1',
  `image_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text,
  `is_approved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `type` enum('product','blog','custom') NOT NULL DEFAULT 'product',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL DEFAULT '',
  `last_name` varchar(100) NOT NULL DEFAULT '',
  `phone` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `role` enum('customer','admin','staff') NOT NULL DEFAULT 'customer',
  `is_email_verified` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `is_active`, `created_at`, `updated_at`, `role`, `is_email_verified`) VALUES
(1, 'smith.keithjohn@gmail.com', 'Fluffypigs2019!', 'Keith', 'Smith', '0787677837', 1, '2025-06-18 18:25:41', '2025-06-18 18:25:41', 'admin', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `categories_slug` (`slug`),
  ADD KEY `categories_parent_id` (`parent_id`),
  ADD KEY `categories_is_active` (`is_active`),
  ADD KEY `categories_sort_order` (`sort_order`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `shipping_address_id` (`shipping_address_id`),
  ADD KEY `billing_address_id` (`billing_address_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_orders_user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_order_items_product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_slug` (`slug`),
  ADD KEY `products_category_id` (`category_id`),
  ADD KEY `products_status` (`status`),
  ADD KEY `products_is_featured` (`is_featured`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id` (`product_id`),
  ADD KEY `product_images_is_primary` (`is_primary`),
  ADD KEY `product_images_position` (`position`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_variants_sku` (`sku`),
  ADD UNIQUE KEY `product_variants_barcode` (`barcode`),
  ADD KEY `image_id` (`image_id`),
  ADD KEY `product_variants_product_id` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `tags_slug` (`slug`),
  ADD KEY `tags_type` (`type`),
  ADD KEY `tags_is_active` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=221;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_image` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_variants_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `product_images` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
