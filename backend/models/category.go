package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(50);not null" json:"name"`
	Type      string         `gorm:"type:enum('income','expense');not null" json:"type"` // income atau expense
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relations
	Transactions []Transaction `gorm:"foreignKey:CategoryID" json:"transactions,omitempty"`
}