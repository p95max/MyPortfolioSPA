import multiprocessing
import os

memory_limit_mb = int(os.getenv("MEMORY_LIMIT", "512"))

if memory_limit_mb <= 512:
    workers = 1
    threads = 2
elif memory_limit_mb <= 1024:
    workers = 2
    threads = 2
else:
    workers = min(4, multiprocessing.cpu_count())
    threads = 2

bind = "0.0.0.0:" + os.getenv("PORT", "8000")
loglevel = "info"
graceful_timeout = 30
max_requests = 1000
max_requests_jitter = 100