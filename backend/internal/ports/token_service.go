package ports

import "github.com/google/uuid"

type TokenService interface {
	GenerateToken(userID uuid.UUID) (string, error)
	ValidateToken(token string) (uuid.UUID, error)
}
