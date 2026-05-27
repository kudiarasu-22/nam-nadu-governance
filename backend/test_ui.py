import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Enable console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        
        print("Navigating to /cm/login...")
        await page.goto("http://localhost:5175/cm/login")
        
        print("Filling form...")
        await page.fill("input[type='email']", "cm@namnadu.gov.in")
        await page.fill("input[type='password']", "demo123")
        
        print("Submitting...")
        await page.click("button[type='submit']")
        
        print("Waiting for network idle...")
        await page.wait_for_load_state('networkidle')
        
        print(f"Final URL: {page.url}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
