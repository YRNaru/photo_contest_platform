"""Gunicorn configuration for production deployment."""

bind = "127.0.0.1:8000"
workers = 3
timeout = 120
graceful_timeout = 120
keepalive = 5

accesslog = "-"
errorlog = "-"
loglevel = "info"
