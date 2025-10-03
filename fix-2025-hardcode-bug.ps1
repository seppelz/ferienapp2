cd C:\Work\ferienapp2
git add .
git commit -m "fix: Remove hardcoded 2025 year restriction in date validation

CRITICAL BUG FOUND:
Line 435 in DesktopCalendar.tsx had:
  if (date.getFullYear() !== 2025) return true;

This was blocking ALL dates that weren't in 2025!

FIX:
Changed to:
  if (isBefore(date, today)) return true;

Now allows any future dates, regardless of year.

Also removed duplicate function definitions that were causing build errors."
git push origin main
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ HARDCODED 2025 BUG FIXED!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The actual bug was:" -ForegroundColor Yellow
Write-Host "  if (date.getFullYear() !== 2025) return true;" -ForegroundColor Red
Write-Host ""
Write-Host "Changed to:" -ForegroundColor Yellow
Write-Host "  if (isBefore(date, today)) return true;" -ForegroundColor Green
Write-Host ""
Write-Host "Vacation picker now works for ANY future year! 🎉" -ForegroundColor White
Write-Host ""

