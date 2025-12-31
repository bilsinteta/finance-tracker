package middleware

import (
	"finance-tracker-backend/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Middleware untuk proteksi route yang butuh login
func AuthRequired(c *fiber.Ctx) error {
	// Ambil token dari header Authorization
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized: No token provided",
		})
	}

	// Format: "Bearer <token>"
	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	// Verify token
	claims, err := utils.VerifyToken(tokenString)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized: Invalid token",
		})
	}

	// Simpan user info di context untuk dipakai di controller
	c.Locals("userID", claims.UserID)
	c.Locals("email", claims.Email)

	return c.Next()
}