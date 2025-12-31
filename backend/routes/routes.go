package routes

import (
	"finance-tracker-backend/controllers"
	"finance-tracker-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// API Group
	api := app.Group("/api")

	// Auth Routes (Public)
	auth := api.Group("/auth")
	auth.Post("/register", controllers.Register)
	auth.Post("/login", controllers.Login)

	// Protected Routes (Butuh Login)
	protected := api.Group("/", middleware.AuthRequired)

	// Profile
	protected.Get("/profile", controllers.GetProfile)

	// Categories
	categories := protected.Group("/categories")
	categories.Get("/", controllers.GetCategories)
	categories.Post("/", controllers.CreateCategory)
	categories.Put("/:id", controllers.UpdateCategory)
	categories.Delete("/:id", controllers.DeleteCategory)

	// Transactions
	transactions := protected.Group("/transactions")
	transactions.Get("/", controllers.GetTransactions)
	transactions.Get("/balance", controllers.GetBalance) // Endpoint khusus untuk balance
	transactions.Get("/:id", controllers.GetTransaction)
	transactions.Post("/", controllers.CreateTransaction)
	transactions.Put("/:id", controllers.UpdateTransaction)
	transactions.Delete("/:id", controllers.DeleteTransaction)
}