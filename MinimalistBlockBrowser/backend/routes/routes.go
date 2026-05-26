package routes

import (
	"minimalist-block-browser/config"
	"minimalist-block-browser/handlers"
	"minimalist-block-browser/web3"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config, rpcClient *web3.RPCClient) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	h := handlers.NewHandler(cfg, rpcClient)

	api := r.Group("/api")
	{
		api.GET("/stats", h.GetStats)
		api.GET("/search", h.Search)

		blocks := api.Group("/blocks")
		{
			blocks.GET("/latest", h.GetLatestBlock)
			blocks.GET("/recent", h.GetRecentBlocks)
			blocks.GET("/number/:number", h.GetBlockByNumber)
			blocks.GET("/hash/:hash", h.GetBlockByHash)
		}

		txs := api.Group("/transactions")
		{
			txs.GET("/:hash", h.GetTransaction)
		}

		addresses := api.Group("/addresses")
		{
			addresses.GET("/:address", h.GetAddress)
			addresses.GET("/:address/transactions", h.GetAddressTransactions)
		}

		gas := api.Group("/gas")
		{
			gas.GET("/tracker", h.GetGasTracker)
			gas.GET("/history", h.GetGasHistory)
		}
	}

	return r
}