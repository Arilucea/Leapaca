"""
Unit tests for build.py

Run with: python3 -m pytest tests/test_build.py -v
"""

import os
import sys
import shutil
import tempfile
import pytest
from pathlib import Path

# Add parent directory to path to import build module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import build


class TestValidateAppName:
    """Test app name validation"""

    def test_valid_app_names(self):
        """Valid app names should pass"""
        assert build.validate_app_name("NX") is True
        assert build.validate_app_name("PV") is True
        assert build.validate_app_name("my-app") is True
        assert build.validate_app_name("my_app") is True
        assert build.validate_app_name("app123") is True

    def test_invalid_empty_name(self):
        """Empty or None app names should raise BuildError"""
        with pytest.raises(build.BuildError, match="non-empty string"):
            build.validate_app_name("")
        
        with pytest.raises(build.BuildError, match="non-empty string"):
            build.validate_app_name(None)

    def test_invalid_path_traversal(self):
        """App names with path traversal should raise BuildError"""
        with pytest.raises(build.BuildError, match="path traversal"):
            build.validate_app_name("../etc")
        
        with pytest.raises(build.BuildError, match="path traversal"):
            build.validate_app_name("app/subdir")
        
        with pytest.raises(build.BuildError, match="path traversal"):
            build.validate_app_name("app\\subdir")

    def test_invalid_special_characters(self):
        """App names with special characters should raise BuildError"""
        with pytest.raises(build.BuildError, match="alphanumeric"):
            build.validate_app_name("app@name")
        
        with pytest.raises(build.BuildError, match="alphanumeric"):
            build.validate_app_name("app name")


class TestMergeFiles:
    """Test file merging functionality"""

    def setup_method(self):
        """Create temporary directory for each test"""
        self.temp_dir = tempfile.mkdtemp()

    def teardown_method(self):
        """Clean up temporary directory after each test"""
        shutil.rmtree(self.temp_dir)

    def test_merge_css_files(self):
        """CSS files should merge with app-specific styles last (to take precedence)"""
        base_css = os.path.join(self.temp_dir, "base.css")
        overlay_css = os.path.join(self.temp_dir, "overlay.css")
        result_css = os.path.join(self.temp_dir, "result.css")

        with open(base_css, 'w') as f:
            f.write(".base { color: blue; }")
        
        with open(overlay_css, 'w') as f:
            f.write(".overlay { color: red; }")

        build.merge_files(base_css, overlay_css, result_css)

        with open(result_css, 'r') as f:
            content = f.read()
        
        assert "/* App-specific styles */" in content
        assert content.index(".overlay") > content.index(".base")

    def test_merge_json_files(self):
        """JSON files should merge correctly"""
        base_json = os.path.join(self.temp_dir, "base.json")
        overlay_json = os.path.join(self.temp_dir, "overlay.json")
        result_json = os.path.join(self.temp_dir, "result.json")

        with open(base_json, 'w') as f:
            f.write('{\n  "base": "value"\n}')
        
        with open(overlay_json, 'w') as f:
            f.write('{\n  "overlay": "value"\n}')

        build.merge_files(base_json, overlay_json, result_json)

        with open(result_json, 'r') as f:
            content = f.read()
        
        assert '"overlay": "value"' in content
        assert '"base": "value"' in content

    def test_merge_missing_base_file(self):
        """If base file is missing, should copy overlay"""
        overlay_css = os.path.join(self.temp_dir, "overlay.css")
        result_css = os.path.join(self.temp_dir, "result.css")
        missing_base = os.path.join(self.temp_dir, "missing.css")

        with open(overlay_css, 'w') as f:
            f.write(".overlay { color: red; }")

        build.merge_files(missing_base, overlay_css, result_css)

        assert os.path.exists(result_css)
        with open(result_css, 'r') as f:
            content = f.read()
        assert ".overlay { color: red; }" in content


class TestBuildApp:
    """Test app building functionality"""

    def setup_method(self):
        """Create temporary directory structure for each test"""
        self.temp_dir = tempfile.mkdtemp()
        self.core_dir = os.path.join(self.temp_dir, "core")
        self.apps_dir = os.path.join(self.temp_dir, "apps")
        self.build_dir = os.path.join(self.temp_dir, "build")
        
        os.makedirs(self.core_dir)
        os.makedirs(self.apps_dir)

        # Override module constants
        build.CORE_DIR = self.core_dir
        build.APPS_DIR = self.apps_dir
        build.BUILD_DIR = self.build_dir

    def teardown_method(self):
        """Clean up temporary directory after each test"""
        shutil.rmtree(self.temp_dir)

    def test_build_nonexistent_app(self):
        """Building non-existent app should raise FileNotFoundError"""
        with pytest.raises(FileNotFoundError, match="not found"):
            build.build_app("NonExistent", self.build_dir)

    def test_build_app_basic(self):
        """Basic app build should copy core and app files"""
        # Create core files
        with open(os.path.join(self.core_dir, "content.js"), 'w') as f:
            f.write("const SELECTORS = {};")
        
        # Create app
        app_dir = os.path.join(self.apps_dir, "TestApp")
        os.makedirs(app_dir)
        with open(os.path.join(app_dir, "content.js"), 'w') as f:
            f.write('const SELECTORS = { test: "value" };')

        build.build_app("TestApp", self.build_dir)

        # Check that files were created
        assert os.path.exists(os.path.join(self.build_dir, "content.js"))
        
        # Check that selectors were injected
        with open(os.path.join(self.build_dir, "content.js"), 'r') as f:
            content = f.read()
        assert 'test: "value"' in content

    def test_build_app_with_subdirectories(self):
        """App build should handle subdirectories"""
        # Create core with subdirectory
        locales_dir = os.path.join(self.core_dir, "_locales", "en")
        os.makedirs(locales_dir)
        with open(os.path.join(locales_dir, "messages.json"), 'w') as f:
            f.write('{"key": "value"}')

        # Create app
        app_dir = os.path.join(self.apps_dir, "TestApp")
        os.makedirs(app_dir)
        with open(os.path.join(app_dir, "manifest.json"), 'w') as f:
            f.write('{"name": "Test"}')

        build.build_app("TestApp", self.build_dir)

        # Check subdirectory was copied
        assert os.path.exists(os.path.join(self.build_dir, "_locales", "en", "messages.json"))
        assert os.path.exists(os.path.join(self.build_dir, "manifest.json"))


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
