import pytest

from backend.app.main import app


@pytest.fixture(autouse=True, scope="module")
def reset_dependency_overrides():
    yield
    app.dependency_overrides.clear()
