from hashlib import sha1
from rest_framework.throttling import SimpleRateThrottle



class ContactEmailThrottle(SimpleRateThrottle):
    scope = "contact_email"
    def get_cache_key(self, request, view):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return None
        return self.cache_format % {"scope": self.scope, "ident": f"contact:{email}"}



class ContactIPThrottle(SimpleRateThrottle):
    scope = "contact_ip"
    def get_cache_key(self, request, view):
        ip = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": f"contact_ip:{ip}"}



class ContactSubnetThrottle(SimpleRateThrottle):
    scope = "contact_subnet"
    def get_cache_key(self, request, view):
        ip = self.get_ident(request) or ""
        parts = ip.split(".")
        subnet = ".".join(parts[:3]) if len(parts) == 4 else ip  # грубо: /24 для IPv4
        return self.cache_format % {"scope": self.scope, "ident": f"contact_subnet:{subnet}"}



class ContactGlobalThrottle(SimpleRateThrottle):
    scope = "contact_global"
    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": "contact_global"}



class ContactMessageFingerprintThrottle(SimpleRateThrottle):
    scope = "contact_fingerprint"
    def get_cache_key(self, request, view):
        raw = (request.data.get("message") or "").strip().lower()
        if not raw:
            return None
        h = sha1(raw.encode("utf-8")).hexdigest()
        return self.cache_format % {"scope": self.scope, "ident": f"contact_msg:{h}"}
