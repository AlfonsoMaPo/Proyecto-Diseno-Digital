
USE `facturaproyecto_unah`;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CASHIER', 'ADMIN') NOT NULL DEFAULT 'CASHIER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_rtn_id VARCHAR(20) DEFAULT 'CF',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('ISSUED', 'VOIDED') NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE invoice_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Registros Iniciales de Prueba (Passwords corresponden a "123456")
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Admin Sistema', 'admin@factura.com', '$2b$10$gv1cMqIV/XOPxTuD81XEA.x4AjyOq4nTNiInhTBqbJ/iBo2mSz/6O', 'ADMIN'),
(2, 'Cajero Juan', 'juan@factura.com', '$2b$10$gv1cMqIV/XOPxTuD81XEA.x4AjyOq4nTNiInhTBqbJ/iBo2mSz/6O', 'CASHIER'),
(3, 'Cajera Maria', 'maria@factura.com', '$2b$10$gv1cMqIV/XOPxTuD81XEA.x4AjyOq4nTNiInhTBqbJ/iBo2mSz/6O', 'CASHIER');

INSERT INTO products (id, code, name, price, stock, is_active) VALUES
(1, 'PROD-001', 'Laptop Student 15"', 450.00, 10, TRUE),
(2, 'PROD-002', 'Mouse Inalámbrico', 15.00, 50, TRUE),
(3, 'PROD-003', 'Teclado Mecánico RGB', 65.00, 5, TRUE);