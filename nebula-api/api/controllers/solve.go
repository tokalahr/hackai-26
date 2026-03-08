package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// SolveStudentQuery handles the /solve endpoint
func SolveStudentQuery(c *gin.Context) {
	// Parse the student's query
	var request struct {
		Query string `json:"query"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Query the /professors API
	professors, err := queryAPI("/professors")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch professors"})
		return
	}

	// Query the /courses API
	courses, err := queryAPI("/courses")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
		return
	}

	// Query the /videos API
	videos, err := queryAPI("/videos")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch videos"})
		return
	}

	// Aggregate data and integrate with LLM
	llmResponse, err := integrateLLM(request.Query, professors, courses, videos)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process query with LLM"})
		return
	}

	response := gin.H{
		"query":           request.Query,
		"recommendations": llmResponse,
	}

	c.JSON(http.StatusOK, response)
}

// queryAPI fetches data from the given API endpoint
func queryAPI(endpoint string) (interface{}, error) {
	resp, err := http.Get("http://localhost:8080" + endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return data, nil
}

// integrateLLM sends the query and aggregated data to the LLM API and returns the response
func integrateLLM(query string, professors, courses, videos interface{}) (interface{}, error) {
	llmAPI := os.Getenv("LLM_API_URL")
	if llmAPI == "" {
		return nil, fmt.Errorf("LLM API URL not configured")
	}

	payload := map[string]interface{}{
		"query":      query,
		"professors": professors,
		"courses":    courses,
		"videos":     videos,
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(llmAPI, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var llmResponse interface{}
	if err := json.NewDecoder(resp.Body).Decode(&llmResponse); err != nil {
		return nil, err
	}

	return llmResponse, nil
}
