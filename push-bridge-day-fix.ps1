cd C:\Work\ferienapp2
git add .
git commit -m "feat: Improve bridge day recommendations to show only 1-2 day efficient options

OLD ALGORITHM:
- Connected holidays and tried to bridge between them
- Often recommended inefficient 3+ day bridges
- Example: Christi Himmelfahrt (Thu May 14) → suggested Mon-Wed (3 days)

NEW ALGORITHM:
- Focus on simple 1-2 day bridge opportunities
- Thursday holiday → Recommend Friday (1 day = 4-day weekend)
- Tuesday holiday → Recommend Monday (1 day = 4-day weekend)  
- Wednesday holiday → 2 options: Mon+Tue OR Thu+Fri (2 days = 5-day weekend)
- Friday holiday → Recommend Thursday (1 day = 4-day weekend)
- Monday holiday → Recommend Friday before (1 day = 4-day weekend)

FEATURES:
- Skip holidays on weekends (no bridge needed)
- Skip bridges during school holidays (already free)
- Skip bridges on other public holidays
- Sort by efficiency (highest first)
- Limit to top 10 recommendations
- All recommendations use max 2 vacation days

EFFICIENCY:
- 1-day bridges: 300% efficiency (4 days off / 1 day used)
- 2-day bridges: 150% efficiency (5 days off / 2 days used)"
git push origin main
Write-Host "Bridge day recommendations now show efficient 1-2 day options! 🌉" -ForegroundColor Green

