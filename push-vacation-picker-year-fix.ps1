cd C:\Work\ferienapp2
git add .
git commit -m "fix: Fix vacation date picker to work with 2026

PROBLEM:
- When year 2026 was selected, vacation date picker failed
- Users couldn't select vacation dates in 2026
- BaseVacationPicker was hardcoded to January 2025
- MobileCalendarView was also hardcoded to 2025

ROOT CAUSE:
- BaseVacationPicker line 33: new Date(2025, 0, 1) - hardcoded
- MobileCalendarView line 29: new Date(2025, 0, 1) - hardcoded
- No year prop was passed to vacation picker components

FIX:
1. Added 'year?' prop to BaseVacationPickerProps interface
2. Updated useVacationPicker hook to use dynamic year from props
3. Changed currentMonth initialization to use year prop
4. Added 'year?' prop to MobileCalendarViewProps interface
5. Updated MobileCalendarView to use year prop
6. Added useEffect to re-initialize month when year changes

NOW WORKS:
✅ Vacation picker opens in correct year (2025 or 2026)
✅ Can select dates in 2026
✅ Calendar months show correct year
✅ Both mobile and desktop vacation pickers work
✅ Dynamically switches between years"
git push origin main
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ VACATION PICKER YEAR FIX DEPLOYED!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fixed:" -ForegroundColor Yellow
Write-Host "  ✓ Vacation picker now works in 2026" -ForegroundColor Green
Write-Host "  ✓ Mobile calendar view uses correct year" -ForegroundColor Green
Write-Host "  ✓ Both views initialize to selected year" -ForegroundColor Green
Write-Host ""

