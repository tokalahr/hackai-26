package routes

import (
	"github.com/UTDNebula/nebula-api/api/controllers"
	"github.com/gin-gonic/gin"
)

func SolveRoute(router *gin.Engine) {
	router.POST("/solve", controllers.SolveStudentQuery)
}
