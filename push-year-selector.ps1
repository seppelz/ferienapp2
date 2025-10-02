cd C:\Work\ferienapp2
git add .
git commit -m "fix: Wire up year selector to actually change calendar year

- Update useBridgeDays hook to accept year parameter
- Add selectedYear state to MainLayout (default 2026)
- Pass year to all holiday hooks and components
- Update Calendar component to use dynamic year
- Fix hardcoded 2025 references
- Connect year change handler to AppNavbar

Now clicking 2025/2026 buttons will actually switch the calendar year!"
git push origin main
Write-Host "Year selector is now fully functional! 🎉" -ForegroundColor Green

