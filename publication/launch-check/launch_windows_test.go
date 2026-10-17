package main

import (
 "os"
 "os/exec"
 "path/filepath"
 "strings"
 "syscall"
 "testing"
)

func TestPowerShellLaunch(t *testing.T) {
 for _, tc := range []struct{name string;flags uint32;required bool}{{"detached_legacy",8,false},{"no_console",0x08000000,true},{"hidden_normal",0,true},{"detached_legacy_pipes",8,false}} {
  t.Run(tc.name,func(t *testing.T){
   dir:=t.TempDir();script:=filepath.Join(dir,"script with spaces.ps1");marker:=filepath.Join(dir,"started")
   body:="$ErrorActionPreference='Stop'\nAdd-Type -AssemblyName System.Windows.Forms\nAdd-Type -AssemblyName System.Drawing\n[IO.File]::WriteAllText('"+strings.ReplaceAll(marker,"'","''")+"','ready')\n"
   if err:=os.WriteFile(script,append([]byte{0xef,0xbb,0xbf},[]byte(body)...),0600);err!=nil{t.Fatal(err)}
   ps:=filepath.Join(os.Getenv("SystemRoot"),"System32","WindowsPowerShell","v1.0","powershell.exe")
   cmd:=exec.Command(ps,"-NoProfile","-STA","-NonInteractive","-ExecutionPolicy","Bypass","-WindowStyle","Hidden","-File",script)
   cmd.SysProcAttr=&syscall.SysProcAttr{HideWindow:true,CreationFlags:tc.flags}
   if tc.name=="no_console" { cmd=newUpdateInstallerCommand(script) }
   var out []byte
   var err error
   if strings.HasSuffix(tc.name,"_pipes"){out,err=cmd.CombinedOutput()}else{err=cmd.Run()}
   raw,readErr:=os.ReadFile(marker)
   t.Logf("flags=%08x exit=%v marker=%q read=%v output=%s",tc.flags,err,raw,readErr,out)
   if tc.required&&(err!=nil||string(raw)!="ready"){t.Fatal("PowerShell launch failed")}
  })
 }
}
