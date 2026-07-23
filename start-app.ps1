$wshell = New-Object -ComObject WScript.Shell
$wshell.Run("cmd.exe /c cd /d C:\u_b_app\frontend && npx expo start --reset-cache", 0, $false)
