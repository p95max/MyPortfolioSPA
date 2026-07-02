from hashlib import sha1
import ipaddress
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
        ip_str = self.get_ident(request) or ""
        try:
            network = ipaddress.ip_network(ip_str, strict=False)
            if network.version == 4:
                subnet = str(ipaddress.ip_network(f"{ip_str}/24", strict=False))
            else:
                subnet = str(ipaddress.ip_network(f"{ip_str}/48", strict=False))
        except ValueError:
            subnet = ip_str
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
    

class AnalyticsThrottle(SimpleRateThrottle):
    scope = "analytics"

    def get_cache_key(self, request, view):
        ip = self.get_ident(request)
        return self.cache_format % {
            "scope": self.scope,
            "ident": f"analytics:{ip}",
        }
    

class AnalyticsGlobalThrottle(SimpleRateThrottle):
    scope = "analytics_global"

    def get_cache_key(self, request, view):
        return self.cache_format % {
            "scope": self.scope,
            "ident": "analytics_global",
        }
