// Package screenshotapi provides a Go client for the ScreenshotAPI service.
package screenshotapi

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

const DefaultBaseURL = "https://screenshotapi.dev"
const DefaultTimeout = 60 * time.Second

type ImageType string

const (
	PNG  ImageType = "png"
	JPEG ImageType = "jpeg"
	WebP ImageType = "webp"
)

type ColorScheme string

const (
	Light ColorScheme = "light"
	Dark  ColorScheme = "dark"
)

type WaitUntil string

const (
	Load            WaitUntil = "load"
	DOMContentLoaded WaitUntil = "domcontentloaded"
	NetworkIdle0    WaitUntil = "networkidle0"
	NetworkIdle2    WaitUntil = "networkidle2"
)

// Client is a ScreenshotAPI client.
type Client struct {
	apiKey     string
	baseURL    string
	httpClient *http.Client
}

// Option configures a Client.
type Option func(*Client)

// WithBaseURL sets a custom base URL for the API.
func WithBaseURL(baseURL string) Option {
	return func(c *Client) {
		c.baseURL = baseURL
	}
}

// WithTimeout sets the HTTP client timeout.
func WithTimeout(timeout time.Duration) Option {
	return func(c *Client) {
		c.httpClient.Timeout = timeout
	}
}

// WithHTTPClient sets a custom HTTP client.
func WithHTTPClient(httpClient *http.Client) Option {
	return func(c *Client) {
		c.httpClient = httpClient
	}
}

// NewClient creates a new ScreenshotAPI client.
func NewClient(apiKey string, opts ...Option) *Client {
	c := &Client{
		apiKey:  apiKey,
		baseURL: DefaultBaseURL,
		httpClient: &http.Client{
			Timeout: DefaultTimeout,
		},
	}
	for _, opt := range opts {
		opt(c)
	}
	return c
}

// ScreenshotOptions configures a screenshot request.
type ScreenshotOptions struct {
	URL             string
	Width           int
	Height          int
	FullPage        bool
	Type            ImageType
	Quality         int
	ColorScheme     ColorScheme
	WaitUntil       WaitUntil
	WaitForSelector string
	Delay           int
}

// Metadata contains response metadata from a screenshot request.
type Metadata struct {
	CreditsRemaining int
	ScreenshotID     string
	DurationMs       int
}

// Result contains the screenshot image data and metadata.
type Result struct {
	Image       []byte
	ContentType string
	Metadata    Metadata
}

// Screenshot takes a screenshot with the given options.
func (c *Client) Screenshot(ctx context.Context, opts ScreenshotOptions) (*Result, error) {
	if opts.URL == "" {
		return nil, fmt.Errorf("screenshotapi: URL is required")
	}

	params := url.Values{}
	params.Set("url", opts.URL)
	if opts.Width > 0 {
		params.Set("width", strconv.Itoa(opts.Width))
	}
	if opts.Height > 0 {
		params.Set("height", strconv.Itoa(opts.Height))
	}
	if opts.FullPage {
		params.Set("fullPage", "true")
	}
	if opts.Type != "" {
		params.Set("type", string(opts.Type))
	}
	if opts.Quality > 0 {
		params.Set("quality", strconv.Itoa(opts.Quality))
	}
	if opts.ColorScheme != "" {
		params.Set("colorScheme", string(opts.ColorScheme))
	}
	if opts.WaitUntil != "" {
		params.Set("waitUntil", string(opts.WaitUntil))
	}
	if opts.WaitForSelector != "" {
		params.Set("waitForSelector", opts.WaitForSelector)
	}
	if opts.Delay > 0 {
		params.Set("delay", strconv.Itoa(opts.Delay))
	}

	reqURL := fmt.Sprintf("%s/api/v1/screenshot?%s", c.baseURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("screenshotapi: failed to create request: %w", err)
	}
	req.Header.Set("x-api-key", c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("screenshotapi: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, parseErrorResponse(resp)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("screenshotapi: failed to read response: %w", err)
	}

	creditsRemaining, _ := strconv.Atoi(resp.Header.Get("x-credits-remaining"))
	durationMs, _ := strconv.Atoi(resp.Header.Get("x-duration-ms"))

	return &Result{
		Image:       body,
		ContentType: resp.Header.Get("Content-Type"),
		Metadata: Metadata{
			CreditsRemaining: creditsRemaining,
			ScreenshotID:     resp.Header.Get("x-screenshot-id"),
			DurationMs:       durationMs,
		},
	}, nil
}

// Save takes a screenshot and saves it to the specified file path.
func (c *Client) Save(ctx context.Context, opts ScreenshotOptions, path string) (*Metadata, error) {
	result, err := c.Screenshot(ctx, opts)
	if err != nil {
		return nil, err
	}

	if err := os.WriteFile(path, result.Image, 0644); err != nil {
		return nil, fmt.Errorf("screenshotapi: failed to write file: %w", err)
	}

	return &result.Metadata, nil
}

func parseErrorResponse(resp *http.Response) error {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return &APIError{
			StatusCode: resp.StatusCode,
			Code:       "unknown_error",
			Message:    fmt.Sprintf("HTTP %d", resp.StatusCode),
		}
	}

	var errResp struct {
		Error   string `json:"error"`
		Message string `json:"message"`
		Balance *int   `json:"balance"`
	}
	if err := json.Unmarshal(body, &errResp); err != nil {
		return &APIError{
			StatusCode: resp.StatusCode,
			Code:       "unknown_error",
			Message:    fmt.Sprintf("HTTP %d: %s", resp.StatusCode, string(body)),
		}
	}

	msg := errResp.Error
	if msg == "" {
		msg = errResp.Message
	}

	switch resp.StatusCode {
	case 401:
		return &AuthenticationError{APIError{StatusCode: 401, Code: "authentication_error", Message: msg}}
	case 402:
		balance := 0
		if errResp.Balance != nil {
			balance = *errResp.Balance
		}
		return &InsufficientCreditsError{
			APIError: APIError{StatusCode: 402, Code: "insufficient_credits", Message: msg},
			Balance:  balance,
		}
	case 403:
		return &InvalidAPIKeyError{APIError{StatusCode: 403, Code: "invalid_api_key", Message: msg}}
	case 500:
		detail := errResp.Message
		if detail == "" {
			detail = msg
		}
		return &ScreenshotFailedError{APIError{StatusCode: 500, Code: "screenshot_failed", Message: detail}}
	default:
		return &APIError{StatusCode: resp.StatusCode, Code: "unknown_error", Message: msg}
	}
}
