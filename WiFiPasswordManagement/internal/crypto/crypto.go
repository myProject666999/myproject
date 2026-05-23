package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"errors"
)

type Service struct {
	key []byte
}

func NewService(masterKey string) *Service {
	h := sha256.Sum256([]byte(masterKey))
	return &Service{key: h[:]}
}

func (s *Service) Encrypt(plaintext []byte) (ciphertext, iv, tag []byte, err error) {
	block, err := aes.NewCipher(s.key)
	if err != nil {
		return nil, nil, nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, nil, nil, err
	}
	iv = make([]byte, gcm.NonceSize())
	if _, err := rand.Read(iv); err != nil {
		return nil, nil, nil, err
	}
	out := gcm.Seal(nil, iv, plaintext, nil)
	tag = out[len(out)-gcm.Overhead():]
	ciphertext = out[:len(out)-gcm.Overhead()]
	return ciphertext, iv, tag, nil
}

func (s *Service) Decrypt(ciphertext, iv, tag []byte) ([]byte, error) {
	block, err := aes.NewCipher(s.key)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	if len(iv) != gcm.NonceSize() {
		return nil, errors.New("invalid iv size")
	}
	full := append([]byte{}, ciphertext...)
	full = append(full, tag...)
	return gcm.Open(nil, iv, full, nil)
}
