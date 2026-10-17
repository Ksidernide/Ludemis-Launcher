//go:build windows

package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
)

func newUpdateInstallerCommand(scriptPath string) *exec.Cmd {
	systemRoot := os.Getenv("SystemRoot")
	if systemRoot == "" {
		systemRoot = `C:\Windows`
	}
	cmd := exec.Command(filepath.Join(systemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe"), "-NoProfile", "-STA", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-File", scriptPath)
	// DETACHED_PROCESS makes Windows PowerShell exit before parsing -File.
	// CREATE_NO_WINDOW hides the console while allowing WinForms progress UI.
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: 0x08000000}
	return cmd
}
