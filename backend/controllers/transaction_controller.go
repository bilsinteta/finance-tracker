package controllers

import (
	"finance-tracker-backend/config"
	"finance-tracker-backend/models"
	"math"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
)

type TransactionRequest struct {
	CategoryID  uint    `json:"category_id"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	Date        string  `json:"date"` // Format: "2024-01-15"
}

// Get All Transactions (dengan filter)
func GetTransactions(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var transactions []models.Transaction
	query := config.DB.Where("user_id = ?", userID)

	// Filter by category
	categoryID := c.Query("category_id")
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	// Filter by date range
	startDate := c.Query("start_date") // Format: 2024-01-01
	endDate := c.Query("end_date")

	if startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("date <= ?", endDate)
	}

	// Pagination
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var total int64
	query.Model(&models.Transaction{}).Count(&total)

	// Preload relations and Apply Pagination
	if err := query.Preload("Category").Order("date DESC").Limit(limit).Offset(offset).Find(&transactions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch transactions"})
	}

	lastPage := math.Ceil(float64(total) / float64(limit))

	return c.JSON(fiber.Map{
		"data": transactions,
		"meta": fiber.Map{
			"total":      total,
			"page":       page,
			"last_page":  lastPage,
			"limit":      limit,
		},
	})
}

// Get Single Transaction
func GetTransaction(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	id := c.Params("id")

	var transaction models.Transaction
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Category").First(&transaction).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}

	return c.JSON(fiber.Map{
		"transaction": transaction,
	})
}

// Create Transaction
func CreateTransaction(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	
	req := new(TransactionRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validasi
	if req.CategoryID == 0 || req.Amount == 0 || req.Date == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Category, amount, and date are required"})
	}

	// Parse date
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format. Use YYYY-MM-DD"})
	}

	// Cek apakah category exists
	var category models.Category
	if err := config.DB.First(&category, req.CategoryID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}

	transaction := models.Transaction{
		UserID:      userID,
		CategoryID:  req.CategoryID,
		Amount:      req.Amount,
		Description: req.Description,
		Date:        date,
	}

	if err := config.DB.Create(&transaction).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create transaction"})
	}

	// Load category relation
	config.DB.Preload("Category").First(&transaction, transaction.ID)

	return c.Status(201).JSON(fiber.Map{
		"message":     "Transaction created successfully",
		"transaction": transaction,
	})
}

// Update Transaction
func UpdateTransaction(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	id := c.Params("id")

	var transaction models.Transaction
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&transaction).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}

	req := new(TransactionRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Update fields
	if req.CategoryID != 0 {
		var category models.Category
		if err := config.DB.First(&category, req.CategoryID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
		}
		transaction.CategoryID = req.CategoryID
	}
	if req.Amount != 0 {
		transaction.Amount = req.Amount
	}
	if req.Description != "" {
		transaction.Description = req.Description
	}
	if req.Date != "" {
		date, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid date format. Use YYYY-MM-DD"})
		}
		transaction.Date = date
	}

	if err := config.DB.Save(&transaction).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update transaction"})
	}

	// Load category relation
	config.DB.Preload("Category").First(&transaction, transaction.ID)

	return c.JSON(fiber.Map{
		"message":     "Transaction updated successfully",
		"transaction": transaction,
	})
}

// Delete Transaction
func DeleteTransaction(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	id := c.Params("id")

	var transaction models.Transaction
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&transaction).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}

	if err := config.DB.Delete(&transaction).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete transaction"})
	}

	return c.JSON(fiber.Map{
		"message": "Transaction deleted successfully",
	})
}

// Get Balance (Total Income - Total Expense)
func GetBalance(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var totalIncome, totalExpense float64

	// Sum income
	config.DB.Table("transactions").
		Select("COALESCE(SUM(amount), 0)").
		Joins("JOIN categories ON transactions.category_id = categories.id").
		Where("transactions.user_id = ? AND categories.type = ?", userID, "income").
		Scan(&totalIncome)

	// Sum expense
	config.DB.Table("transactions").
		Select("COALESCE(SUM(amount), 0)").
		Joins("JOIN categories ON transactions.category_id = categories.id").
		Where("transactions.user_id = ? AND categories.type = ?", userID, "expense").
		Scan(&totalExpense)

	balance := totalIncome - totalExpense

	return c.JSON(fiber.Map{
		"total_income":  totalIncome,
		"total_expense": totalExpense,
		"balance":       balance,
	})
}