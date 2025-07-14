# Debug script to test service mapping for a single item
$item = Get-Content "@data/rm-archive/498356.json" | ConvertFrom-Json

Write-Host "Item ID: $($item.Id)"
Write-Host "Current Services: $($item.Services)"
Write-Host "Categories:"
$item.Categories | ForEach-Object { Write-Host "  - $_" }

# Map categories to services using the same logic as the main script
$services = @()
foreach ($cat in $item.Categories) {
    $catLower = $cat.ToString().ToLower()
    
    Write-Host "Processing category: '$cat' -> '$catLower'"
    
    if ($catLower -like "*teams*") { 
        Write-Host "  Matched: Microsoft Teams"
        $services += "Microsoft Teams" 
    }
    elseif ($catLower -like "*sharepoint*") { 
        Write-Host "  Matched: SharePoint Online"
        $services += "SharePoint Online" 
    }
    elseif ($catLower -eq "exchange" -or $catLower -like "*exchange*") { 
        Write-Host "  Matched: Exchange Online"
        $services += "Exchange Online" 
    }
    elseif ($catLower -like "*outlook*") { 
        Write-Host "  Matched: Outlook"
        $services += "Outlook" 
    }
    else {
        Write-Host "  No match"
    }
}

Write-Host ""
Write-Host "Mapped services: $($services -join ', ')"
Write-Host "Services count: $($services.Count)"

# Default to Microsoft 365 Roadmap if no specific service found
if ($services.Count -eq 0) {
    $services = @("Microsoft 365 Roadmap")
    Write-Host "Applied default: Microsoft 365 Roadmap"
}

# Remove duplicates
$services = $services | Sort-Object | Get-Unique
Write-Host "After deduplication: $($services -join ', ')"

# Use array if multiple services, string if single service
$servicesField = if ($services.Count -gt 1) {
    Write-Host "Multiple services - keeping as array"
    $services  # Keep as array for multiple services
} else {
    Write-Host "Single service - converting to string: $($services[0])"
    # Ensure we get the full string, not just the first character
    if ($services -is [array]) {
        $services[0]
    } else {
        $services
    }
}

Write-Host "Final Services field: $servicesField"
Write-Host "Final Services type: $($servicesField.GetType().Name)"
