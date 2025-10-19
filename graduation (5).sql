-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 28, 2025 at 09:44 AM
-- Server version: 8.0.42
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `graduation`
--

-- --------------------------------------------------------

--
-- Table structure for table `adminusers`
--

CREATE TABLE `adminusers` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `branch` varchar(10) NOT NULL,
  `is_first_login` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `adminusers`
--

INSERT INTO `adminusers` (`id`, `username`, `password`, `branch`, `is_first_login`) VALUES
(1, 'cse', '$2b$12$C.lUBA1PSgVDNA4QvkFGrODBssaMXKJYNU7QuA0o82Yb8ZZRxIBsW', 'CSE', 0),
(2, 'ece', '$2b$12$sWBkthJd6iQd6my/SqQXguHNimZBbl.UMJZL7007W7o.X6WUTndBy', 'ECE', 0),
(3, 'eee', '$2b$12$qwjK1jsVY5GQh3B6bk8AJ.F5.slE0ACoBNdvgbyHt1WgxBu08hXrm', 'EXAM', 0),
(4, 'mba', '$2b$12$aTp9KyF.UJ2AvoZSZ4w/eu6WH7U4nyqCd2Guwuz9YEJn7tnki955C', 'MBA', 0),
(5, 'me', '$2b$12$K8xpyu6qdRgJ24gZqZ1jtumem.bNALQj.Gc3tLyBomgpPgNVdlUdm', 'ME', 0),
(6, 'cst', '$2b$12$gTgcwXtuWa6GsMb1jiij9OUFfQ8almkY4DpRDy1qT9pQLsGDjcyNW', 'CST', 0),
(7, 'cai', '$2b$12$wpgft9ubT/vsX6m2Rw26s.CFugtBpMac6GrI7ryQ1vVRCkkeH4No2', 'CAI', 0),
(8, 'aim', '$2b$12$2caRAIqcfPdzvQKj5yj.cehm4m2wiC73HxqBvk67y1nu1O4cjdr8C', 'AIML', 0),
(9, 'ect', 'ect@123', 'ECT', 1),
(10, 'examsection', '$2b$12$CjkGmaar6.tvI9o2VSHOBOC48DGwMzlb8JiOud0s.qSiB2ZO5Hn0e', 'EXAM', 0),
(11, 'principal', '$2b$12$hP9NTEp0ukzj3yCVz.DPted6SfRgaHGmj1pF9LqpjYd.h8VOlI6U2', 'EXAM', 0),
(12, 'atridatta', '$2b$12$T9QWJ7o0DavTJQVTBWxkAOWrpJP5SainpsrVhFdvwdp0baneLcCli', 'EXAM', 0),

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int NOT NULL,
  `rollno` varchar(10) NOT NULL,
  `will_attend` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `attendance`
--
--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `id` int NOT NULL,
  `rollno` varchar(10) NOT NULL,
  `guest_name` varchar(30) NOT NULL,
  `relationship` varchar(20) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `guests`
--
-- --------------------------------------------------------

--
-- Table structure for table `submitted_students`
--

CREATE TABLE `submitted_students` (
  `id` int NOT NULL,
  `rollno` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `branch` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `rollno` varchar(10) NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `father` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `branch` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `program` varchar(10) NOT NULL,
  `aadhar` varchar(12) NOT NULL,
  `email` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--
-- --------------------------------------------------------

--
-- Table structure for table `user_references`
--

CREATE TABLE `user_references` (
  `id` int NOT NULL,
  `rollno` varchar(20) NOT NULL,
  `reference_id` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_references`
--
--
-- Indexes for dumped tables
--

--
-- Indexes for table `adminusers`
--
ALTER TABLE `adminusers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rollno` (`rollno`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rollno` (`rollno`);

--
-- Indexes for table `submitted_students`
--
ALTER TABLE `submitted_students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rollno` (`rollno`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`rollno`);

--
-- Indexes for table `user_references`
--
ALTER TABLE `user_references`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rollno` (`rollno`),
  ADD KEY `rollno_2` (`rollno`),
  ADD KEY `reference_id` (`reference_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `adminusers`
--
ALTER TABLE `adminusers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=950;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1396;

--
-- AUTO_INCREMENT for table `submitted_students`
--
ALTER TABLE `submitted_students`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `user_references`
--
ALTER TABLE `user_references`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1030;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`rollno`) REFERENCES `users` (`rollno`);

--
-- Constraints for table `guests`
--
ALTER TABLE `guests`
  ADD CONSTRAINT `guests_ibfk_1` FOREIGN KEY (`rollno`) REFERENCES `users` (`rollno`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
