"""OAuth redirect helpers for web and extension flows."""

from urllib.parse import urlparse

EXTENSION_REDIRECT_SESSION_KEY = "extension_redirect_uri"
EXTENSION_LOGIN_PATH = "/accounts/extension/auth-complete/"
DEFAULT_PROFILE_PATH = "/accounts/profile/"
ALLOWED_EXTENSION_PROVIDERS = {"google", "twitter_oauth2"}


def is_valid_extension_redirect_uri(redirect_uri: str) -> bool:
    """Return True when the redirect URI is a valid chromiumapp URL."""
    parsed = urlparse(redirect_uri)
    hostname = parsed.hostname or ""

    if parsed.scheme != "https":
        return False

    if not hostname.endswith(".chromiumapp.org"):
        return False

    extension_id = hostname.removesuffix(".chromiumapp.org")
    return bool(extension_id)


def get_post_login_redirect_path(request) -> str:
    """Choose the post-login destination for web or extension flows."""
    if request.session.get(EXTENSION_REDIRECT_SESSION_KEY):
        return EXTENSION_LOGIN_PATH
    return DEFAULT_PROFILE_PATH
