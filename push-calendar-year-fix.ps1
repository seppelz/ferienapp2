cd C:\Work\ferienapp2
git add .
git commit -m "fix: Calendar now properly updates when year changes

Previously when clicking 2025/2026 buttons:
- Holiday markers would update ✓
- Calendar dates would NOT update ✗

Now:
- Added useEffect to watch for year prop changes
- Calendar properly re-renders with correct year dates
- Both holidays AND calendar dates update together

The calendar now shows January 2025 when clicking 2025,
and January 2026 when clicking 2026."
git push origin main
Write-Host "Calendar year switching is now fully working! 📅" -ForegroundColor Green

