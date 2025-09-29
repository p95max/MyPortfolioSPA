import multiprocessing
import os

workers = multiprocessing.cpu_count() * 2 + 1
threads = 2
bind = "0.0.0.0:" + os.getenv("PORT", "8000")
loglevel = "info"
graceful_timeout = 30