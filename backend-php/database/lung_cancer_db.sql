-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2025 at 01:11 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lung_cancer_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `specialite` varchar(100) DEFAULT NULL,
  `role` enum('medecin','admin','patient') DEFAULT 'medecin',
  `photo_profil` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nom`, `prenom`, `email`, `password`, `telephone`, `specialite`, `role`, `photo_profil`, `created_at`, `updated_at`) VALUES
(1, 'CHARIF', 'CHAIMA', 'chaimachari37@gmail.com', '$2y$10$5uy.KC1hNsyYtkErs5YiYeameXSmdY5Ae7ZiipR7WP.JTEByG/Jf6', '0637620992', '', 'patient', NULL, '2025-12-10 22:17:49', '2025-12-10 22:17:49'),
(2, 'TestConsole', 'User', 'testconsole@test.com', '$2y$10$zIz0zGp2pV18O2OOn5GICuoswe7RI/BpTBlDIxYJrXn.lQk7te7x2', '0612345678', '', 'medecin', NULL, '2025-12-10 23:33:19', '2025-12-10 23:33:19'),
(3, 'Debug', 'Test', 'debug1765409635548@test.com', '$2y$10$3MQ7Xo0kFu/JGp6KxtmeLefgh6vbAL0o94hZaziScapaMBZXv2./W', '0612345678', '', 'medecin', NULL, '2025-12-10 23:33:55', '2025-12-10 23:33:55'),
(4, 'chaima', 'chaima', 'charifchaima272@gmail.com', '$2y$10$e24lbUHtXvu0mqdgsasPiuMilTDz1Unt6ifnnjJLA5BGqunzlAPn2', '0637620992', '', 'patient', NULL, '2025-12-10 23:41:50', '2025-12-10 23:41:50'),
(5, 'ikram', 'ikram', 'eziouani.ikram@gmail.com', '$2y$10$ZuSPFssDwI48vx2o5XilY.6b/24WUgN4dRn/HXdUbq6RTYgIkZ7j.', '65563563653', '', 'admin', NULL, '2025-12-11 10:49:18', '2025-12-11 10:49:18'),
(6, 'ikram', 'ikram', 'eziouani.ikrame@gmail.com', '$2y$10$xcsmemT227O8DYtdliv62ePuXYILzV783bNAqdPyb2wFmU0yzoD5G', '65563563653', '', 'medecin', NULL, '2025-12-11 10:50:00', '2025-12-11 10:50:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
