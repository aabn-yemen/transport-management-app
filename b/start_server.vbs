Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\u_b_app\backend"
WshShell.Run "node node_modules/tsx/dist/cli.mjs src/index.ts", 0, False
