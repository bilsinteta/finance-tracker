package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// Request body for AI Insight
type AIRequest struct {
	Transactions []TransactionSummary `json:"transactions"`
}

type TransactionSummary struct {
	Date     string  `json:"date"`
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Type     string  `json:"type"` // income or expense
}

func GetFinancialInsight(c *fiber.Ctx) error {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return c.Status(500).JSON(fiber.Map{"error": "API Key Gemini belum disetting di .env"})
	}

	var req AIRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Simplify data for token efficiency
	var totalIncome, totalExpense float64
	for _, tx := range req.Transactions {
		if tx.Type == "income" {
			totalIncome += tx.Amount
		} else {
			totalExpense += tx.Amount
		}
	}
	// summaryText = fmt.Sprintf("Total Income: %.2f, Total Expense: %.2f. Trasaction details: ", totalIncome, totalExpense)

	// Limit transactions to last 20 for context window efficiency if needed,
	// but for now just dumping generic summary or the JSON string.
	// Converting the full struct to string might be too heavy, let's just send the JSON as string.
	txJSON, _ := json.Marshal(req.Transactions)

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create Gemini client"})
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-3-flash-preview") // User requested futuristic model
	model.SetTemperature(0.7)

	prompt := fmt.Sprintf(`
		Analisa transaksi berikut dan berikan saran keuangan singkat (maksimal 2 kalimat) dalam Bahasa Indonesia.
		Fokus pada penghematan atau pola pengeluaran yang tidak wajar. Jangan terlalu kaku.
		
		Data Transaksi:
		%s
	`, string(txJSON))

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		fmt.Printf("GEMINI ERROR: %v\n", err) // Explicit debug print
		return c.Status(500).JSON(fiber.Map{"error": fmt.Sprintf("Gagal menghubungi AI: %v", err)})
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return c.Status(500).JSON(fiber.Map{"error": "No response from AI"})
	}

	// Extract text response
	var aiResponse string
	for _, part := range resp.Candidates[0].Content.Parts {
		if txt, ok := part.(genai.Text); ok {
			aiResponse += string(txt)
		}
	}

	return c.JSON(fiber.Map{"insight": aiResponse})
}
