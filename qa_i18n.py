import os
import re
import json

def main():
    print("Running QA TASK 4: Multi-Language Audit...")
    
    src_dir = "e:/Nam_Nadu/Nam_Nadu/Nam_Nadu/frontend/src"
    en_file = os.path.join(src_dir, "i18n", "en.json")
    ta_file = os.path.join(src_dir, "i18n", "ta.json")
    
    with open(en_file, "r", encoding="utf-8") as f:
        en_keys = set(json.load(f).keys())
    with open(ta_file, "r", encoding="utf-8") as f:
        ta_keys = set(json.load(f).keys())
        
    t_pattern = re.compile(r"t\(['\"]([a-zA-Z0-9_\.]+)['\"]")
    
    used_keys = set()
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".jsx", ".js")):
                with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                    content = f.read()
                    matches = t_pattern.findall(content)
                    for m in matches:
                        used_keys.add(m)
                        
    missing_in_en = used_keys - en_keys
    missing_in_ta = used_keys - ta_keys
    
    # Check nested keys? In this project, it seems keys are flat or structured.
    # Actually wait, `t('auth.login')` requires `{ "auth": { "login": "..." } }`.
    # Let's write a flatten function for JSON.
    
    def flatten(d, parent_key=''):
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}.{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(flatten(v, new_key).items())
            else:
                items.append((new_key, v))
        return dict(items)

    with open(en_file, "r", encoding="utf-8") as f:
        en_flat = set(flatten(json.load(f)).keys())
    with open(ta_file, "r", encoding="utf-8") as f:
        ta_flat = set(flatten(json.load(f)).keys())

    missing_in_en = used_keys - en_flat
    missing_in_ta = used_keys - ta_flat

    if missing_in_en or missing_in_ta:
        print("FAIL: Missing translation keys!")
        if missing_in_en:
            print(f"Missing in en.json: {missing_in_en}")
        if missing_in_ta:
            print(f"Missing in ta.json: {missing_in_ta}")
        # sys.exit(1) # We don't exit, we just report it so I can fix it
    else:
        print("PASS: All translation keys are covered.")

if __name__ == "__main__":
    main()
