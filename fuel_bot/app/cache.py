"""Redis and in-memory cache adapters."""

from __future__ import annotations

import json
import time
from typing import Any, Protocol

from redis.asyncio import Redis


class Cache(Protocol):
    async def get_json(self, key: str) -> Any | None: ...

    async def set_json(self, key: str, value: Any, ttl: int | None = None) -> None: ...

    async def acquire(self, key: str, ttl: int) -> bool: ...

    async def increment(self, key: str, ttl: int) -> int: ...

    async def delete(self, key: str) -> None: ...

    async def close(self) -> None: ...


class RedisCache:
    def __init__(self, url: str) -> None:
        self._redis = Redis.from_url(url, decode_responses=True)

    async def get_json(self, key: str) -> Any | None:
        value = await self._redis.get(key)
        return json.loads(value) if value is not None else None

    async def set_json(self, key: str, value: Any, ttl: int | None = None) -> None:
        payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        await self._redis.set(key, payload, ex=ttl)

    async def acquire(self, key: str, ttl: int) -> bool:
        return bool(await self._redis.set(key, "1", ex=ttl, nx=True))

    async def increment(self, key: str, ttl: int) -> int:
        async with self._redis.pipeline(transaction=True) as pipeline:
            pipeline.incr(key)
            pipeline.expire(key, ttl, nx=True)
            count, _ = await pipeline.execute()
        return int(count)

    async def delete(self, key: str) -> None:
        await self._redis.delete(key)

    async def close(self) -> None:
        await self._redis.aclose()


class MemoryCache:
    """Small development/test fallback with the same semantics as RedisCache."""

    def __init__(self) -> None:
        self._values: dict[str, tuple[float | None, Any]] = {}

    def _read(self, key: str) -> Any | None:
        entry = self._values.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if expires_at is not None and expires_at <= time.monotonic():
            self._values.pop(key, None)
            return None
        return value

    async def get_json(self, key: str) -> Any | None:
        return self._read(key)

    async def set_json(self, key: str, value: Any, ttl: int | None = None) -> None:
        expires_at = time.monotonic() + ttl if ttl else None
        self._values[key] = (expires_at, value)

    async def acquire(self, key: str, ttl: int) -> bool:
        if self._read(key) is not None:
            return False
        await self.set_json(key, 1, ttl)
        return True

    async def increment(self, key: str, ttl: int) -> int:
        count = int(self._read(key) or 0) + 1
        await self.set_json(key, count, ttl)
        return count

    async def delete(self, key: str) -> None:
        self._values.pop(key, None)

    async def close(self) -> None:
        self._values.clear()
