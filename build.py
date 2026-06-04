import os
import shutil
import json
import re
import sys

CORE_DIR = 'core'
APPS_DIR = 'apps'
BUILD_DIR = 'build'
CONTENT_JS = 'content.js'
POPUP_JS = 'popup.js'
POPUP_HTML = 'popup.html'
SELECTORS_PATTERN = r'const SELECTORS = \{\};'
IS_HOME_PAGE_PATTERN = r'// is-home-page-function'
APP_ON_MESSAGE_PATTERN = r'// app-on-message'
APP_VIDEO_INIT_PATTERN = r'// app-video-init'
APP_TRY_NEXT_EPISODE_PATTERN = r'// app-try-next-episode'
APP_TRY_SKIP_ADS_PATTERN = r'// app-try-skip-ads'

class BuildError(Exception):
    """Custom exception for build-related errors"""
    pass

def merge_files(base_path, overlay_path, result_path):
    """Merge base and overlay files based on file type"""
    try:
        with open(base_path, 'r', encoding='utf-8') as f:
            base_content = f.read()
        with open(overlay_path, 'r', encoding='utf-8') as f:
            overlay_content = f.read()

        merged = ""

        if base_path.endswith('.css'):
            merged = base_content + "\n\n/* App-specific styles */\n" + overlay_content
        elif base_path.endswith('.json'):
            try:
                merged = overlay_content[:-1].rstrip() + ",\n" + base_content[1:].lstrip('\n\r')
            except IndexError as e:
                raise BuildError(f"Invalid JSON structure in {overlay_path} or {base_path}") from e
        else:
            return
        
        with open(result_path, 'w', encoding='utf-8') as f:
            f.write(merged + "\n")
    except FileNotFoundError as e:
        print(f"Warning: Base file not found, copying overlay directly: {e}")
        shutil.copy2(overlay_path, result_path)
    except (IOError, OSError) as e:
        raise BuildError(f"Failed to merge files {base_path} and {overlay_path}: {e}") from e

def validate_app_name(app_name):
    """Validate app name for security and correctness"""
    if not app_name or not isinstance(app_name, str):
        raise BuildError("App name must be a non-empty string")
    
    if '..' in app_name or '/' in app_name or '\\' in app_name:
        raise BuildError(f"Invalid app name '{app_name}': contains path traversal characters")
    
    if not re.match(r'^[a-zA-Z0-9_-]+$', app_name):
        raise BuildError(f"Invalid app name '{app_name}': must contain only alphanumeric characters, hyphens, and underscores")
    
    return True

def build_app(app_name, target_dir):
    """Build a specific app by merging core files with app-specific overlays"""
    print(f"Building app: {app_name} into {target_dir}...")
    
    validate_app_name(app_name)
    
    app_dir = os.path.join(APPS_DIR, app_name)
    
    if not os.path.exists(app_dir):
        raise FileNotFoundError(f"App directory '{app_dir}' not found")
    
    if not os.path.isdir(app_dir):
        raise BuildError(f"'{app_dir}' is not a directory")

    os.makedirs(target_dir, exist_ok=True)

    # 1. Copy all core files to target
    if os.path.exists(CORE_DIR):
        for item in os.listdir(CORE_DIR):
            s = os.path.join(CORE_DIR, item)
            d = os.path.join(target_dir, item)
            try:
                if os.path.isdir(s):
                    if os.path.exists(d):
                        shutil.rmtree(d)
                    shutil.copytree(s, d)
                else:
                    shutil.copy2(s, d)
            except (IOError, OSError) as e:
                raise BuildError(f"Failed to copy core file {s}: {e}") from e

    # List of files to process for placeholders
    files_to_process = [CONTENT_JS, POPUP_JS, POPUP_HTML]
    
    # 2. Process placeholders in the target files using app files if they exist
    for filename in files_to_process:
        target_file_path = os.path.join(target_dir, filename)
        source_file_path = os.path.join(app_dir, filename)
        
        if os.path.exists(target_file_path):
            # Load app specific content if it exists
            app_content = ""
            if os.path.exists(source_file_path):
                with open(source_file_path, 'r', encoding='utf-8') as f:
                    app_content = f.read()
            
            with open(target_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if filename == CONTENT_JS:
                # Extract selectors block
                selectors_match = re.search(r'const SELECTORS = \{.*?\};', app_content, re.DOTALL)
                app_selectors = selectors_match.group(0) if selectors_match else SELECTORS_PATTERN
                
                # Extract isHomePage expression
                home_func_match = re.search(r'const IS_HOME_PAGE = \(path\) => (.*?);', app_content, re.DOTALL)
                app_is_home_page = f"return {home_func_match.group(1).strip()}" if home_func_match else "return false"

                content = re.sub(SELECTORS_PATTERN, app_selectors, content, count=1)
                content = re.sub(IS_HOME_PAGE_PATTERN, app_is_home_page, content, count=1)
                
                on_message_match = re.search(r'/\* APP_ON_MESSAGE_START \*/(.*?)/\* APP_ON_MESSAGE_END \*/', app_content, re.DOTALL)
                content = re.sub(APP_ON_MESSAGE_PATTERN, on_message_match.group(1).strip() if on_message_match else "// No on-message", content, count=1)
                
                video_init_match = re.search(r'/\* APP_VIDEO_INIT_START \*/(.*?)/\* APP_VIDEO_INIT_END \*/', app_content, re.DOTALL)
                content = re.sub(APP_VIDEO_INIT_PATTERN, video_init_match.group(1).strip() if video_init_match else "// No video-init", content, count=1)
                
                try_next_episode_match = re.search(r'/\* APP_TRY_NEXT_EPISODE_START \*/(.*?)/\* APP_TRY_NEXT_EPISODE_END \*/', app_content, re.DOTALL)
                content = re.sub(APP_TRY_NEXT_EPISODE_PATTERN, try_next_episode_match.group(1).strip() if try_next_episode_match else "// No try-next-episode", content, count=1)
                
                try_skip_ads_match = re.search(r'/\* APP_TRY_SKIP_ADS_START \*/(.*?)/\* APP_TRY_SKIP_ADS_END \*/', app_content, re.DOTALL)
                content = re.sub(APP_TRY_SKIP_ADS_PATTERN, try_skip_ads_match.group(1).strip() if try_skip_ads_match else "// No try-skip-ads", content, count=1)

            elif filename == POPUP_JS:
                placeholders = ['vars', 'defaults', 'config', 'save', 'listeners', 'main-vars', 'main-defaults', 'main-config', 'main-save', 'main-listeners']
                for p in placeholders:
                    pattern = f'// app-popup-{p}'
                    marker = p.upper().replace('-', '_')
                    match = re.search(rf'/\* APP_POPUP_{marker}_START \*/(.*?)/\* APP_POPUP_{marker}_END \*/', app_content, re.DOTALL)
                    replacement = match.group(1).strip() if match else f"// No {p}"
                    content = re.sub(pattern, replacement, content, count=1)

            elif filename == POPUP_HTML:
                placeholders = ['sidebar-top-buttons', 'settings-toggles', 'main-toggles']
                for p in placeholders:
                    pattern = f'<!-- app-{p} -->'
                    marker = p.upper().replace('-', '_')
                    match = re.search(rf'<!-- APP_{marker}_START -->(.*?)<!-- APP_{marker}_END -->', app_content, re.DOTALL)
                    replacement = match.group(1).strip() if match else f"<!-- No {p} -->"
                    content = re.sub(pattern, replacement, content, count=1)

            with open(target_file_path, 'w', encoding='utf-8') as f:
                f.write(content)

    # 3. Handle other files in app_dir (copy/merge)
    for root, _, files in os.walk(app_dir):
        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), app_dir)
            if rel_path in files_to_process:
                continue # Already processed
                
            target_file_path = os.path.join(target_dir, rel_path)
            source_file_path = os.path.join(root, file)
            
            try:
                os.makedirs(os.path.dirname(target_file_path), exist_ok=True)
                
                if file.endswith('.json') and os.path.exists(target_file_path):
                    merge_files(target_file_path, source_file_path, target_file_path)
                elif file.endswith('.css') and os.path.exists(target_file_path):
                    merge_files(target_file_path, source_file_path, target_file_path)
                else:
                    shutil.copy2(source_file_path, target_file_path)
            except (IOError, OSError) as e:
                raise BuildError(f"Failed to process file {source_file_path}: {e}") from e

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Building a specific app - only clean that app's folder
        app_to_build = sys.argv[1]
        try:
            validate_app_name(app_to_build)
            target_path = os.path.join(BUILD_DIR, app_to_build)
            
            if os.path.exists(target_path):
                print(f"Cleaning existing '{target_path}' folder...")
                try:
                    shutil.rmtree(target_path)
                except OSError as e:
                    print(f"Error: Failed to clean app directory: {e}")
                    sys.exit(1)
            
            build_app(app_to_build, target_path)
            print(f"Successfully built '{app_to_build}' into '{target_path}/' folder.")
        except (BuildError, FileNotFoundError) as e:
            print(f"Error building app '{app_to_build}': {e}")
            sys.exit(1)
        except Exception as e:
            print(f"Unexpected error building app '{app_to_build}': {e}")
            sys.exit(1)
    else:
        # Building all apps - clean the entire build directory
        if os.path.exists(BUILD_DIR):
            print(f"Cleaning existing '{BUILD_DIR}' folder...")
            try:
                shutil.rmtree(BUILD_DIR)
            except OSError as e:
                print(f"Error: Failed to clean build directory: {e}")
                sys.exit(1)
        
        try:
            available_apps = [d for d in os.listdir(APPS_DIR) if os.path.isdir(os.path.join(APPS_DIR, d))]
        except FileNotFoundError:
            print(f"Error: Apps directory '{APPS_DIR}' not found.")
            sys.exit(1)
        except OSError as e:
            print(f"Error: Failed to list apps directory: {e}")
            sys.exit(1)
            
        if not available_apps:
            print(f"Error: No apps found in '{APPS_DIR}' directory.")
            sys.exit(1)
            
        print(f"No app specified. Building all available apps into '{BUILD_DIR}/<app_name>'...")
        failed_apps = []
        for app in available_apps:
            try:
                build_app(app, os.path.join(BUILD_DIR, app))
            except (BuildError, FileNotFoundError) as e:
                print(f"Error building app '{app}': {e}")
                failed_apps.append(app)
            except Exception as e:
                print(f"Unexpected error building app '{app}': {e}")
                failed_apps.append(app)
        
        if failed_apps:
            print(f"Build completed with errors. Failed apps: {', '.join(failed_apps)}")
            sys.exit(1)
        else:
            print(f"Successfully finished multi-app build into '{BUILD_DIR}/' folder.")

