import pytest
import requests

@pytest.fixture(scope="session")
def base_url():
    return "https://propbol-tsiq.onrender.com"

@pytest.fixture(scope="session")
def auth_token():
    return None
