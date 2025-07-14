-- First, create the table without the foreign key constraint
CREATE TABLE IF NOT EXISTS `product_versions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `version_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Then add the foreign key constraint if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'product_versions';
SET @constraintname = 'fk_product_versions_product_id';

SET @query = CONCAT('ALTER TABLE `', @tablename, '` ADD CONSTRAINT `', @constraintname, '` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE');
SET @query = IF((SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_SCHEMA = @dbname 
                AND TABLE_NAME = @tablename 
                AND CONSTRAINT_NAME = @constraintname) = 0, 
                @query, 'SELECT 1');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
