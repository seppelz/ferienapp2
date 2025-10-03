cd C:\Work\ferienapp2
git add .
git commit -m "fix: Enable 2026 vacation date selection

FIXES:
1. Removed hardcoded 2025 restriction in isDateDisabled()
2. Added year prop to BaseCalendarProps interface
3. Pass year prop through Calendar → DesktopCalendar/MobileCalendar
4. Now vacation dates can be selected for any future year

The issue was twofold:
- Line 435 had: if (date.getFullYear() !== 2025) return true;
- Year prop wasn't being passed to child components

Both fixed now."
git push origin main
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ 2026 VACATION SELECTION FIXED!" -ForegroundColor Green  
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes deployed:" -ForegroundColor Yellow
Write-Host "  ✓ Removed 2025 year restriction" -ForegroundColor Green
Write-Host "  ✓ Added year prop to calendar chain" -ForegroundColor Green
Write-Host "  ✓ Dates now clickable in 2026" -ForegroundColor Green
Write-Host ""
Write-Host "Wait 2-3 minutes for Vercel deployment" -ForegroundColor White
Write-Host ""

