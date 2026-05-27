import asyncio
from playwright.async_api import async_playwright

FRONTEND_URL = "http://localhost:5173"

async def check_url(page, expected_url_suffix, timeout=5000):
    try:
        await page.wait_for_url(f"**{expected_url_suffix}*", timeout=timeout)
        return True
    except Exception:
        return False

async def test_mla_flow(p):
    print("\n--- TEST MLA FLOW ---")
    browser = await p.chromium.launch(headless=True)
    page = await browser.new_page()
    
    try:
        print("1. Open /mla/login")
        await page.goto(f"{FRONTEND_URL}/mla/login")
        
        print("2. Login with valid MLA credentials")
        await page.fill("input[type='text']", "TN-MLA-CHENNAI-001")
        await page.fill("input[type='password']", "demo123")
        await page.click("button[type='submit']")
        
        print("3. Verify Redirects to /dashboard/mla")
        success = await check_url(page, "/dashboard/mla")
        if not success:
            print(f"FAIL: Expected /dashboard/mla, got {page.url}")
            return False
            
        print("   Verify Dashboard loads (no blank screen)")
        await page.wait_for_selector("text=Constituency Portal", timeout=5000)
        
        print("4. Refresh browser on /dashboard/mla")
        await page.reload()
        await page.wait_for_load_state('networkidle')
        success = await check_url(page, "/dashboard/mla")
        if not success:
            print(f"FAIL: Expected session persistence on /dashboard/mla, got {page.url}")
            return False
            
        print("5. Logout")
        await page.click("button:has-text('Logout')")
        success = await check_url(page, "/mla/login")
        if not success:
            print(f"FAIL: Expected redirect to /mla/login after logout, got {page.url}")
            return False
            
        print("PASS: MLA Flow")
        return True
    except Exception as e:
        print(f"FAIL: MLA Flow Exception - {e}")
        return False
    finally:
        await browser.close()

async def test_cm_flow(p):
    print("\n--- TEST CM FLOW ---")
    browser = await p.chromium.launch(headless=True)
    page = await browser.new_page()
    
    try:
        print("1. Open /cm/login")
        await page.goto(f"{FRONTEND_URL}/cm/login")
        
        print("2. Login with valid CM credentials")
        await page.fill("input[type='email']", "cm@namnadu.gov.in")
        await page.fill("input[type='password']", "demo123")
        await page.click("button[type='submit']")
        
        print("3. Verify Redirects to /dashboard/cm")
        success = await check_url(page, "/dashboard/cm")
        if not success:
            print(f"FAIL: Expected /dashboard/cm, got {page.url}")
            return False
            
        print("   Verify Dashboard loads (sidebar loads)")
        await page.wait_for_selector("text=Command Center", timeout=5000)
        
        print("4. Refresh browser on /dashboard/cm")
        await page.reload()
        await page.wait_for_load_state('networkidle')
        success = await check_url(page, "/dashboard/cm")
        if not success:
            print(f"FAIL: Expected session persistence on /dashboard/cm, got {page.url}")
            return False
            
        print("5. Logout")
        await page.click("button:has-text('Logout Super Admin')")
        success = await check_url(page, "/cm/login")
        if not success:
            print(f"FAIL: Expected redirect to /cm/login after logout, got {page.url}")
            return False
            
        print("PASS: CM Flow")
        return True
    except Exception as e:
        print(f"FAIL: CM Flow Exception - {e}")
        return False
    finally:
        await browser.close()

async def test_routing_matrix(p):
    print("\n--- ROUTING TEST MATRIX ---")
    browser = await p.chromium.launch(headless=True)
    
    matrix = [
        {"url": "/dashboard/mla", "expected": "/mla/login"},
        {"url": "/dashboard/cm", "expected": "/cm/login"},
        {"url": "/dashboard/citizen", "expected": "/login"}
    ]
    
    all_pass = True
    for test in matrix:
        page = await browser.new_page()
        try:
            print(f"Testing direct access to {test['url']} without login...")
            await page.goto(f"{FRONTEND_URL}{test['url']}")
            success = await check_url(page, test['expected'])
            if not success:
                print(f"FAIL: Expected redirect to {test['expected']}, got {page.url}")
                all_pass = False
            else:
                print(f"PASS: Redirected to {test['expected']} correctly.")
        except Exception as e:
            print(f"FAIL: Exception on {test['url']} - {e}")
            all_pass = False
        finally:
            await page.close()
            
    await browser.close()
    return all_pass

async def main():
    async with async_playwright() as p:
        r1 = await test_routing_matrix(p)
        r2 = await test_mla_flow(p)
        r3 = await test_cm_flow(p)
        
        if r1 and r2 and r3:
            print("\n===============================")
            print("FINAL REPORT: PASS")
            print("All routes and login flows verified successfully.")
            print("===============================")
        else:
            print("\n===============================")
            print("FINAL REPORT: FAIL")
            print("Some tests failed. Check logs above.")
            print("===============================")

if __name__ == "__main__":
    asyncio.run(main())
