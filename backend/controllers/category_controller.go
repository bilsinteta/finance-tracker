package controllers

import (
	"finance-tracker-backend/config"
	"finance-tracker-backend/models"

	"github.com/gofiber/fiber/v2"
)

type CategoryRequest struct {
	Name string `json:"name"`
	Type string `json:"type"` // "income" atau "expense"
}

// Get All Categories
func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	
	// Optional filter by type (income/expense)
	typeFilter := c.Query("type")
	
	query := config.DB
	if typeFilter != "" {
		query = query.Where("type = ?", typeFilter)
	}
	
	if err := query.Find(&categories).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch categories"})
	}

	return c.JSON(fiber.Map{
		"categories": categories,
	})
}

// Create Category
func CreateCategory(c *fiber.Ctx) error {
	req := new(CategoryRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validasi
	if req.Name == "" || req.Type == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name and type are required"})
	}

	if req.Type != "income" && req.Type != "expense" {
		return c.Status(400).JSON(fiber.Map{"error": "Type must be 'income' or 'expense'"})
	}

	category := models.Category{
		Name: req.Name,
		Type: req.Type,
	}

	if err := config.DB.Create(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create category"})
	}

	return c.Status(201).JSON(fiber.Map{
		"message":  "Category created successfully",
		"category": category,
	})
}

// Update Category
func UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var category models.Category
	if err := config.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}

	req := new(CategoryRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Update fields
	if req.Name != "" {
		category.Name = req.Name
	}
	if req.Type != "" {
		if req.Type != "income" && req.Type != "expense" {
			return c.Status(400).JSON(fiber.Map{"error": "Type must be 'income' or 'expense'"})
		}
		category.Type = req.Type
	}

	if err := config.DB.Save(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update category"})
	}

	return c.JSON(fiber.Map{
		"message":  "Category updated successfully",
		"category": category,
	})
}

// Delete Category
func DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	
	var category models.Category
	if err := config.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}

	if err := config.DB.Delete(&category).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete category"})
	}

	return c.JSON(fiber.Map{
		"message": "Category deleted successfully",
	})
}