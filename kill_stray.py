import os
import signal
import time

killed = 0
for pid in os.listdir('/proc'):
    if pid.isdigit():
        try:
            cwd = os.readlink(f'/proc/{pid}/cwd')
            if 'vamsicrackers/frontend' in cwd:
                with open(f'/proc/{pid}/comm', 'r') as f:
                    comm = f.read().strip()
                if comm == 'node' or comm == 'npm':
                    # Only kill if it's been running for a bit to avoid killing the newly started crashing ones
                    # Actually, we can just kill it. If PM2 restarts it, fine.
                    os.kill(int(pid), signal.SIGKILL)
                    print(f"Killed {pid} ({comm}) in {cwd}")
                    killed += 1
        except Exception:
            pass

print(f"Total killed: {killed}")
