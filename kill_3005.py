import subprocess
import os

output = subprocess.check_output("netstat -tulpn", shell=True).decode()
for line in output.split('\n'):
    if ":3005" in line:
        parts = line.split()
        pid_prog = parts[-1]
        pid = pid_prog.split('/')[0]
        if pid.isdigit():
            os.system(f"kill -9 {pid}")
            print(f"Killed {pid}")
