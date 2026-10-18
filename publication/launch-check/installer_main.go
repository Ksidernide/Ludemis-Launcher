package main
import("os";"strconv")
func main(){
 if len(os.Args)!=5{os.Exit(2)}
 cmd:=newUpdateInstallerCommand(os.Args[1])
 out,err:=os.Create(os.Args[2]);if err!=nil{os.Exit(3)};defer out.Close()
 log,err:=os.Create(os.Args[3]);if err!=nil{os.Exit(4)};defer log.Close()
 cmd.Stdout=out;cmd.Stderr=log
 if err=cmd.Start();err!=nil{log.WriteString(err.Error());os.Exit(5)}
 os.WriteFile(os.Args[4],[]byte(strconv.Itoa(cmd.Process.Pid)),0600)
 if err=cmd.Wait();err!=nil{log.WriteString(err.Error());os.Exit(6)}
}
