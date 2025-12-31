package main

import (
	"finance-tracker-backend/config"
	"finance-tracker-backend/models"
	"finance-tracker-backend/routes"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Connect to database
	config.ConnectDB()

	// Auto migrate database tables
	if err := config.DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Transaction{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migrated successfully!")

	// Seed default categories (optional)
	seedCategories()

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(500).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Setup routes
	routes.SetupRoutes(app)

	// Health check
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Finance Tracker API is running!",
			"version": "1.0.0",
		})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on http://localhost:%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// Seed default categories (hanya jalan sekali)
func seedCategories() {
	var count int64
	config.DB.Model(&models.Category{}).Count(&count)

	if count == 0 {
		defaultCategories := []models.Category{
			{Name: "Gaji", Type: "income"},
			{Name: "Freelance", Type: "income"},
			{Name: "Bonus", Type: "income"},
			{Name: "Makanan", Type: "expense"},
			{Name: "Transport", Type: "expense"},
			{Name: "Belanja", Type: "expense"},
			{Name: "Tagihan", Type: "expense"},
			{Name: "Hiburan", Type: "expense"},
		}

		config.DB.Create(&defaultCategories)
		log.Println("Default categories seeded successfully!")
	}
}
