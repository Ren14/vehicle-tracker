package app

import (
	"context"
	"fmt"
	"time"

	"github.com/Ren14/vehicle-tracker/backend/internal/domain"
	"github.com/Ren14/vehicle-tracker/backend/internal/ports"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo     ports.UserRepository
	tokenService ports.TokenService
}

func NewAuthService(userRepo ports.UserRepository, tokenService ports.TokenService) *AuthService {
	return &AuthService{
		userRepo:     userRepo,
		tokenService: tokenService,
	}
}

func (s *AuthService) Register(ctx context.Context, email, password string) (string, *domain.User, error) {
	existing, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil && err != domain.ErrNotFound {
		return "", nil, fmt.Errorf("checking existing user: %w", err)
	}
	if existing != nil {
		return "", nil, domain.ErrAlreadyExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return "", nil, fmt.Errorf("hashing password: %w", err)
	}

	user := &domain.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(hash),
		CreatedAt:    time.Now().UTC(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return "", nil, fmt.Errorf("creating user: %w", err)
	}

	token, err := s.tokenService.GenerateToken(user.ID)
	if err != nil {
		return "", nil, fmt.Errorf("generating token: %w", err)
	}

	return token, user, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, *domain.User, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if err == domain.ErrNotFound {
			return "", nil, domain.ErrUnauthorized
		}
		return "", nil, fmt.Errorf("finding user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", nil, domain.ErrUnauthorized
	}

	token, err := s.tokenService.GenerateToken(user.ID)
	if err != nil {
		return "", nil, fmt.Errorf("generating token: %w", err)
	}

	return token, user, nil
}
