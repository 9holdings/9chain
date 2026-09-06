// Synthetic loopback RPC fixture. No blockchain, keys, state, or public listener.
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		var request struct {
			JSONRPC string          `json:"jsonrpc"`
			ID      int             `json:"id"`
			Method  string          `json:"method"`
			Params  json.RawMessage `json:"params"`
		}
		if r.Method != "POST" || json.NewDecoder(r.Body).Decode(&request) != nil ||
			request.JSONRPC != "2.0" || request.ID != 1 {
			http.Error(w, "invalid synthetic request", 400)
			return
		}
		fmt.Printf("REQUEST %s %s\n", r.URL.Path, request.Method)
		if strings.Contains(r.URL.Path, "Hang") {
			// Remain blocked until the actual curl closes its connection. A killed
			// Docker client alone may leave that process and connection running.
			<-r.Context().Done()
			fmt.Printf("CANCELLED %s\n", r.URL.Path)
			return
		}
		if strings.Contains(r.URL.Path, "HttpError") {
			http.Error(w, "synthetic unavailable", 503)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if strings.Contains(r.URL.Path, "BadJson") {
			fmt.Fprint(w, "{incomplete")
			return
		}
		var result any
		switch request.Method {
		case "health.health":
			var params struct {
				Tags []string `json:"tags"`
			}
			if json.Unmarshal(request.Params, &params) != nil || len(params.Tags) != 1 || params.Tags[0] != "Subnet111" {
				http.Error(w, "missing synthetic subnet tag", 400)
				return
			}
			result = map[string]any{"healthy": true, "checks": map[string]any{"Blockchain111": map[string]any{}}}
		case "eth_chainId":
			result = "0x218805ca4" // 9001000100, independently checked by the caller.
			if os.Getenv("FIXTURE_WRONG_ID") == "1" {
				result = "0x1"
			}
		default:
			http.Error(w, "unsupported synthetic read", 400)
			return
		}
		id := request.ID
		if strings.Contains(r.URL.Path, "BadEnvelope") {
			id = 7
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"jsonrpc": "2.0", "id": id, "result": result})
	})
	log.Fatal(http.ListenAndServe("127.0.0.1:9650", nil))
}
