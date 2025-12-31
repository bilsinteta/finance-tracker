package controllers

import (
	"finance-tracker-backend/config"
	"finance-tracker-backend/models"
	"finance-tracker-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Register User Baru
func Register(c *fiber.Ctx) error {
	req := new(RegisterRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validasi input
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "All fields are required"})
	}

	// Cek apakah email sudah terdaftar
	var existingUser models.User
	if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "Email already registered"})
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	// Buat user baru
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "User registered successfully",
		"token":   token,
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// Login User
func Login(c *fiber.Ctx) error {
	req := new(LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validasi input
	if req.Email == "" || req.Password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email and password are required"})
	}

	// Cari user berdasarkan email
	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Cek password
	if !utils.CheckPassword(user.Password, req.Password) {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// Get Profile (Protected Route)
func GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(fiber.Map{
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// Structs for input
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// Change Password
func ChangePassword(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	req := new(ChangePasswordRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.OldPassword == "" || req.NewPassword == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Old and new passwords are required"})
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Verify old password
	if !utils.CheckPassword(user.Password, req.OldPassword) {
		return c.Status(401).JSON(fiber.Map{"error": "Incorrect old password"})
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	// Update password
	user.Password = hashedPassword
	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update password"})
	}

	return c.JSON(fiber.Map{"message": "Password updated successfully"})
}

// Delete Account
func DeleteAccount(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	// Transaction to delete user and related data if necessary (GORM usually handles cascading if configured, or soft delete)
	// Assuming strict delete for now since user requested "delete account"

	// First delete transactions? Or let GORM constraints handle it.
	// For safety, let's just delete the user.
	if err := config.DB.Delete(&models.User{}, userID).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete account"})
	}

	return c.JSON(fiber.Map{"message": "Account deleted successfully"})
}
