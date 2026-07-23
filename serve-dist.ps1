$wshell = New-Object -ComObject WScript.Shell
$wshell.Run("cmd.exe /c cd /d C:\u_b_app\frontend && npx serve dist -p 3000 --no-clipboard", 0, $false)
