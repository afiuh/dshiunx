// Jarvis tiny detector：常驻极低内存，只负责手机开关、心跳、按需启停完整服务。
package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"os/exec"
	"sync"
	"syscall"
	"time"
)

type state struct {
	mu            sync.Mutex
	armed         bool
	lastHeartbeat time.Time
	daemon        *exec.Cmd
	daemonCmd     string
	timeout       time.Duration
}

type armReq struct {
	Armed bool `json:"armed"`
}

func (s *state) startDaemon() {
	if s.daemon != nil {
		return
	}
	cmd := exec.Command("sh", "-c", s.daemonCmd)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		log.Printf("start daemon: %v", err)
		return
	}
	s.daemon = cmd
	log.Printf("daemon started pid=%d", cmd.Process.Pid)
}

func (s *state) stopDaemon() {
	if s.daemon == nil {
		return
	}
	cmd := s.daemon
	s.daemon = nil
	_ = cmd.Process.Signal(syscall.SIGTERM)
	done := make(chan struct{})
	go func() { _ = cmd.Wait(); close(done) }()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		_ = cmd.Process.Kill()
		<-done
	}
	log.Printf("daemon stopped pid=%d", cmd.Process.Pid)
}

func (s *state) setArmed(v bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.armed = v
	s.lastHeartbeat = time.Now()
	if v {
		s.startDaemon()
	} else {
		s.stopDaemon()
	}
}

func (s *state) heartbeat() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.lastHeartbeat = time.Now()
}

func daemonState() string {
	data, err := os.ReadFile("/tmp/weiyesha-state.json")
	if err != nil {
		return "unknown"
	}
	var v struct {
		State string `json:"state"`
	}
	if json.Unmarshal(data, &v) != nil {
		return "unknown"
	}
	return v.State
}

func (s *state) status() map[string]any {
	s.mu.Lock()
	defer s.mu.Unlock()
	pid := 0
	if s.daemon != nil && s.daemon.Process != nil {
		pid = s.daemon.Process.Pid
	}
	return map[string]any{
		"armed":          s.armed,
		"daemon_running": s.daemon != nil,
		"pid":            pid,
		"last_heartbeat": s.lastHeartbeat.Format(time.RFC3339),
		"daemon_state":   daemonState(),
	}
}

func (s *state) watchdog() {
	t := time.NewTicker(5 * time.Second)
	defer t.Stop()
	for range t.C {
		s.mu.Lock()
		if s.armed && time.Since(s.lastHeartbeat) > s.timeout {
			log.Printf("heartbeat timeout; disarming")
			s.armed = false
			s.stopDaemon()
		}
		s.mu.Unlock()
	}
}

func auth(next http.HandlerFunc, token string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Token") != token {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}

func main() {
	listen := flag.String("listen", ":8386", "listen address")
	token := flag.String("token", "", "auth token (required)")
	daemonCmd := flag.String("daemon", "sleep 3600", "command to start full service")
	timeout := flag.Duration("timeout", 60*time.Second, "heartbeat timeout")
	flag.Parse()
	if *token == "" {
		log.Fatal("-token is required")
	}

	s := &state{daemonCmd: *daemonCmd, timeout: *timeout}
	go s.watchdog()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})
	mux.HandleFunc("/status", auth(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(s.status())
	}, *token))
	mux.HandleFunc("/wake", auth(func(w http.ResponseWriter, r *http.Request) {
		s.mu.Lock()
		cmd := s.daemon
		s.mu.Unlock()
		if cmd == nil || cmd.Process == nil {
			http.Error(w, "daemon not running", http.StatusServiceUnavailable)
			return
		}
		if err := cmd.Process.Signal(syscall.SIGUSR2); err != nil {
			http.Error(w, "wake failed: "+err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"ok": true, "pid": cmd.Process.Pid})
	}, *token))
	mux.HandleFunc("/trigger", auth(func(w http.ResponseWriter, r *http.Request) {
		s.mu.Lock()
		cmd := s.daemon
		s.mu.Unlock()
		if cmd == nil || cmd.Process == nil {
			http.Error(w, "daemon not running", http.StatusServiceUnavailable)
			return
		}
		if err := cmd.Process.Signal(syscall.SIGUSR1); err != nil {
			http.Error(w, "trigger failed: "+err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"ok": true, "pid": cmd.Process.Pid})
	}, *token))
	mux.HandleFunc("/heartbeat", auth(func(w http.ResponseWriter, r *http.Request) {
		s.heartbeat()
		json.NewEncoder(w).Encode(s.status())
	}, *token))
	mux.HandleFunc("/arm", auth(func(w http.ResponseWriter, r *http.Request) {
		var req armReq
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}
		s.setArmed(req.Armed)
		json.NewEncoder(w).Encode(s.status())
	}, *token))

	log.Printf("detector listening %s (timeout=%s)", *listen, *timeout)
	log.Fatal(http.ListenAndServe(*listen, mux))
}
