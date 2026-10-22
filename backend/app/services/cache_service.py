import time
from typing import Any, Optional, Dict

class SimpleMemoryCache:
    def __init__(self, default_ttl: int = 900): # 15 minutes default
        self.default_ttl = default_ttl
        self._store: Dict[str, Dict[str, Any]] = {}
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if not entry:
            self.misses += 1
            return None
        if time.time() > entry["expires_at"]:
            del self._store[key]
            self.misses += 1
            return None
        self.hits += 1
        return entry["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        validity = ttl if ttl is not None else self.default_ttl
        self._store[key] = {
            "value": value,
            "expires_at": time.time() + validity,
            "created_at": time.time()
        }

    def delete(self, key: str) -> None:
        if key in self._store:
            del self._store[key]

    def clear(self) -> None:
        self._store.clear()

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_items": len(self._store),
            "hits": self.hits,
            "misses": self.misses,
            "hit_ratio": (self.hits / (self.hits + self.misses)) if (self.hits + self.misses) > 0 else 0.0
        }

cache = SimpleMemoryCache()
