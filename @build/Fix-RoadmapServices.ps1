# Fix existing roadmap data by reprocessing categories to generate proper Services field
# This script processes individual roadmap archive files instead of the main roadmap.json

Write-Host "Fixing Services field in individual roadmap archive files..."

$dataPath = "./@data"
$archivePath = "$dataPath/rm-archive"

if (!(Test-Path $archivePath)) {
    Write-Error "Archive path not found: $archivePath"
    exit 1
}

# Get all roadmap archive files
$archiveFiles = Get-ChildItem -Path $archivePath -Filter "*.json"
Write-Host "Found $($archiveFiles.Count) roadmap archive files"

$fixedCount = 0
$unchangedCount = 0
$totalCount = 0

foreach ($file in $archiveFiles) {
    $totalCount++
    
    try {
        # Load the individual roadmap item
        $item = Get-Content $file.FullName | ConvertFrom-Json
        
        # Skip if Services field is already properly formatted (not single character)
        if ($item.Services -is [string] -and $item.Services.Length -eq 1) {
            # This item needs fixing
            
            # Map categories to services using the same logic as the main script
            $services = @()
            foreach ($cat in $item.Categories) {
                $catLower = $cat.ToString().ToLower()
                
                if ($catLower -like "*teams*") { $services += "Microsoft Teams" }
                elseif ($catLower -like "*sharepoint*") { $services += "SharePoint Online" }
                elseif ($catLower -eq "exchange" -or $catLower -like "*exchange*") { $services += "Exchange Online" }
                elseif ($catLower -like "*outlook*") { $services += "Outlook" }
                elseif ($catLower -like "*onedrive*") { $services += "OneDrive for Business" }
                elseif ($catLower -like "*copilot*") { $services += "Microsoft Copilot (Microsoft 365)" }
                elseif ($catLower -like "*viva*") { $services += "Microsoft Viva" }
                elseif ($catLower -like "*purview*") { $services += "Microsoft Purview compliance portal" }
                elseif ($catLower -like "*word*") { $services += "Microsoft 365 Apps" }
                elseif ($catLower -like "*excel*") { $services += "Microsoft 365 Apps" }
                elseif ($catLower -like "*powerpoint*") { $services += "Microsoft 365 Apps" }
                elseif ($catLower -like "*power bi*" -or $catLower -like "*powerbi*") { $services += "Power BI" }
                elseif ($catLower -like "*power apps*" -or $catLower -like "*powerapps*") { $services += "PowerApps" }
                elseif ($catLower -like "*power automate*" -or $catLower -like "*flow*") { $services += "Power Automate" }
                elseif ($catLower -like "*power virtual*") { $services += "Power Virtual Agents" }
                elseif ($catLower -like "*defender*" -and $catLower -like "*office*") { $services += "Microsoft Defender for Office 365" }
                elseif ($catLower -like "*defender*" -and $catLower -like "*endpoint*") { $services += "Microsoft Defender for Endpoint" }
                elseif ($catLower -like "*defender*" -and $catLower -like "*identity*") { $services += "Microsoft Defender for Identity" }
                elseif ($catLower -like "*defender*" -and $catLower -like "*business*") { $services += "Microsoft Defender for Business" }
                elseif ($catLower -like "*defender*" -and $catLower -like "*cloud*") { $services += "Microsoft Defender for Cloud Apps" }
                elseif ($catLower -like "*entra*" -or $catLower -like "*azure ad*" -or $catLower -like "*azuread*" -or $catLower -like "*azure active directory*" -or $catLower -like "*authentication*" -or $catLower -like "*identity*") { $services += "Microsoft Entra" }
                elseif ($catLower -like "*intune*") { $services += "Microsoft Intune" }
                elseif ($catLower -like "*planner*") { $services += "Planner" }
                elseif ($catLower -like "*to do*" -or $catLower -like "*todo*") { $services += "Microsoft To Do" }
                elseif ($catLower -like "*onenote*") { $services += "OneNote" }
                elseif ($catLower -like "*visio*") { $services += "Visio" }
                elseif ($catLower -like "*project*") { $services += "Microsoft Project" }
                elseif ($catLower -like "*forms*") { $services += "Forms" }
                elseif ($catLower -like "*stream*") { $services += "Microsoft Stream" }
                elseif ($catLower -like "*bookings*") { $services += "Bookings" }
                elseif ($catLower -like "*whiteboard*") { $services += "Whiteboard" }
                elseif ($catLower -like "*sway*") { $services += "Microsoft Sway" }
                elseif ($catLower -like "*delve*") { $services += "Microsoft Delve" }
                elseif ($catLower -like "*yammer*" -or $catLower -like "*engage*") { $services += "Microsoft Viva" }
                elseif ($catLower -like "*lists*") { $services += "Microsoft Lists" }
                elseif ($catLower -like "*loop*") { $services += "Microsoft Loop" }
                elseif ($catLower -like "*clipchamp*") { $services += "Microsoft Clipchamp" }
                elseif ($catLower -like "*edge*") { $services += "Microsoft Edge" }
                elseif ($catLower -like "*search*") { $services += "Microsoft Search" }
                elseif ($catLower -like "*graph*") { $services += "Microsoft Graph" }
                elseif ($catLower -like "*universal print*") { $services += "Universal Print" }
                elseif ($catLower -like "*windows 365*") { $services += "Windows 365" }
                elseif ($catLower -like "*minecraft*") { $services += "Minecraft Education" }
                elseif ($catLower -like "*admin*") { $services += "Microsoft 365 admin center" }
                elseif ($catLower -like "*office 365*") { $services += "Office 365" }
                elseif ($catLower -like "*access*") { $services += "Access" }
                elseif ($catLower -like "*publisher*") { $services += "Microsoft Publisher" }
                elseif ($catLower -like "*information protection*") { $services += "Microsoft Information Protection" }
                elseif ($catLower -like "*azure information protection*") { $services += "Azure Information Protection" }
            }
            
            # Default to Microsoft 365 Roadmap if no specific service found
            if ($services.Count -eq 0) {
                $services = @("Microsoft 365 Roadmap")
            }
            
            # Remove duplicates
            $services = $services | Sort-Object | Get-Unique
            
            # Use array if multiple services, string if single service
            $servicesField = if ($services.Count -gt 1) {
                $services  # Keep as array for multiple services
            } else {
                # Ensure we get the full string, not just the first character
                if ($services -is [array]) {
                    $services[0]
                } else {
                    $services
                }
            }
            
            # Update the item
            $oldService = $item.Services
            $item.Services = $servicesField
            $fixedCount++
            
            # Save the updated individual file
            $item | ConvertTo-Json -Depth 10 | Set-Content -Path $file.FullName
            
            Write-Host "Fixed item $($item.Id): '$oldService' -> '$($servicesField)'"
        } else {
            $unchangedCount++
        }
    }
    catch {
        Write-Warning "Failed to process file $($file.Name): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Processing complete:"
Write-Host "- Fixed items: $fixedCount"
Write-Host "- Unchanged items: $unchangedCount"  
Write-Host "- Total items: $totalCount"

# Now regenerate the main roadmap.json from the fixed individual files
Write-Host ""
Write-Host "Regenerating main roadmap.json file..."

$allRoadmapItems = @()
foreach ($file in $archiveFiles) {
    try {
        $item = Get-Content $file.FullName | ConvertFrom-Json
        $allRoadmapItems += $item
    }
    catch {
        Write-Warning "Failed to read file $($file.Name): $($_.Exception.Message)"
    }
}

# Sort by PubDate (most recent first)
$allRoadmapItems = $allRoadmapItems | Sort-Object { [DateTime]$_.PubDate } -Descending

# Save the regenerated roadmap.json
$allRoadmapItems | ConvertTo-Json -Depth 10 | Set-Content -Path "$dataPath/roadmap.json"

Write-Host "Regenerated roadmap.json with $($allRoadmapItems.Count) items"
Write-Host "Fix complete!"
