import os
import re

def audit_buttons():
    frontend_dir = os.path.join("frontend", "src")
    dead_buttons = []
    
    # Simple regex to catch buttons without onClick or type="submit" in forms
    button_pattern = re.compile(r'<button([^>]*?)>(.*?)</button>', re.DOTALL)
    
    for root, _, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith((".jsx", ".tsx", ".js")):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                    for match in button_pattern.finditer(content):
                        attrs = match.group(1)
                        # Check if it has onClick or type="submit"
                        if "onClick" not in attrs and "type=\"submit\"" not in attrs and "type='submit'" not in attrs and "type={\"submit\"}" not in attrs:
                            # It might be in a form or disabled, let's just flag it for review
                            if "disabled" not in attrs:
                                dead_buttons.append(f"{filepath}: {match.group(0).strip()[:50]}...")
                                
    return dead_buttons

if __name__ == "__main__":
    print("Running QA TASK 6: Button Audit...")
    dead_buttons = audit_buttons()
    
    if dead_buttons:
        print(f"FAIL: Found {len(dead_buttons)} potentially dead buttons (no onClick/submit):")
        for btn in dead_buttons:
            print(f"  - {btn}")
        # sys.exit(1) # We won't strictly fail just yet, manual review needed
    else:
        print("PASS: All buttons have interactions!")
