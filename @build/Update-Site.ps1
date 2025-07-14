# Get the latest M365 Message Center items and update the site

param($GraphSecret)
function Connect-MicrosoftGraph(){
    # Use environment variables for tenant and client configuration
    $tenantId = $env:TENANT_ID
    $clientId = $env:CLIENT_ID
    
    if ([string]::IsNullOrEmpty($tenantId) -or [string]::IsNullOrEmpty($clientId)) {
        Write-Error "TENANT_ID and CLIENT_ID environment variables must be set"
        throw "Missing required environment variables: TENANT_ID and/or CLIENT_ID"
    }
    
    Write-Host "Using environment variables for tenant and client configuration"

    $secret = $GraphSecret
    if([string]::IsNullOrEmpty($GraphSecret)){ # If we are running in Github get the secret from the parameter
        Write-Host "-GraphSecret not supplied"
        $secret = Get-Content ./@build/secrets-m365.json | ConvertFrom-Json
    }

    [securestring]$secSecret = ConvertTo-SecureString $secret -AsPlainText -Force
    [pscredential]$cred = New-Object System.Management.Automation.PSCredential ($clientId, $secSecret)
    Write-Host "Connecting to Microsoft Graph"
    Connect-MgGraph -TenantId $tenantId -Credential $cred -NoWelcome
}

function Get-M365MessageCenterItems() {
    Write-Host "Getting Message Center items"
    $mc = Get-MgServiceAnnouncementMessage -Top 999  -Sort "LastModifiedDateTime desc" -All
    return $mc
}

function Get-M365RoadmapItems() {
    Write-Host "Getting Microsoft 365 Roadmap items"
    try {
        $rssUrl = "https://www.microsoft.com/releasecommunications/api/v2/m365/rss"
        $response = Invoke-WebRequest -Uri $rssUrl -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            # Clean the content to remove BOM and fix encoding issues
            $xmlContent = $response.Content
            
            # Remove BOM if present
            if ($xmlContent.StartsWith("﻿")) {
                $xmlContent = $xmlContent.Substring(1)
            }
            
            # Parse the XML content
            try {
                [xml]$rssContent = $xmlContent
            } catch {
                Write-Warning "Failed to parse XML: $($_.Exception.Message)"
                # Try with encoding fix
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($xmlContent)
                $cleanXml = [System.Text.Encoding]::UTF8.GetString($bytes)
                if ($cleanXml.StartsWith("﻿")) {
                    $cleanXml = $cleanXml.Substring(1)
                }
                [xml]$rssContent = $cleanXml
            }
            
            $roadmapItems = @()
            
            # Check if we have items
            if ($rssContent.rss.channel.item) {
                $itemCount = 0
                foreach ($item in $rssContent.rss.channel.item) {
                    try {
                        $itemCount++
                        if ($itemCount -gt 2500) { break } # Limit to first 2500 items to capture most roadmap content
                        
                        # Extract categories as an array
                        $categories = @()
                        if ($item.category) {
                            if ($item.category -is [array]) {
                                $categories = $item.category
                            } else {
                                $categories = @($item.category)
                            }
                        }
                        
                        # Map categories to services
                        $services = @()
                        foreach ($cat in $categories) {
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
                        
                        # Remove duplicates and ensure we have a proper array
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
                        
                        # Extract the roadmap ID from the link
                        $roadmapId = ""
                        if ($item.link -and $item.link -match "id=(\d+)") {
                            $roadmapId = "$($matches[1])"
                        } else {
                            $roadmapId = "$itemCount"  # Fallback if no ID found
                        }
                        
                        # Use full description without truncation
                        $description = $item.description
                        
                        $roadmapItem = @{
                            Id = $roadmapId
                            Title = $item.title
                            Description = $description
                            Link = $item.link
                            PubDate = $item.pubDate
                            LastModifiedDateTime = $item.pubDate  # Use PubDate as LastModifiedDateTime for consistency
                            Categories = $categories
                            Services = $servicesField  # Use string for single service, array for multiple
                            Type = "roadmap"
                            IsMajorChange = $false  # Roadmap items are not marked as major changes
                        }
                        $roadmapItems += $roadmapItem
                    }
                    catch {
                        Write-Warning "Failed to process roadmap item $itemCount : $($_.Exception.Message)"
                        continue
                    }
                }
            }
            
            Write-Host "Successfully processed $($roadmapItems.Count) roadmap items"
            return $roadmapItems
        } else {
            Write-Warning "HTTP request failed with status: $($response.StatusCode)"
            return @()
        }
    }
    catch {
        Write-Warning "Failed to fetch roadmap data: $($_.Exception.Message)"
        return @()
    }
}

$dataPath = "./@data"

# Ensure rm-archive directory exists for roadmap items
if (!(Test-Path "$dataPath/rm-archive")) {
    New-Item -ItemType Directory -Path "$dataPath/rm-archive" -Force
}

Connect-MicrosoftGraph
$msgItems = Get-M365MessageCenterItems
$roadmapItems = Get-M365RoadmapItems

Write-Host "Updating site data with $($msgItems.Count) message center items and $($roadmapItems.Count) roadmap items"

# Process Message Center items (only save if changed or new)
$newOrUpdatedMCCount = 0
foreach($msg in $msgItems){
    $msg.Title = $msg.Title.Replace('(Updated) ', '')
    $msg.body.content = $msg.body.content -replace '\[(.*?)\]', '<b>$1</b>'

    $filePath = "$($dataPath)/archive/$($msg.Id).json"
    $shouldSave = $false
    
    if (Test-Path $filePath) {
        # File exists, check if content has changed
        try {
            $existingContent = Get-Content $filePath -Raw | ConvertFrom-Json
            
            # Compare key fields that would indicate a real change
            $hasChanged = $false
            
            if ($existingContent.Title -ne $msg.Title) { $hasChanged = $true }
            if ($existingContent.LastModifiedDateTime -ne $msg.LastModifiedDateTime) { $hasChanged = $true }
            if ($existingContent.body.content -ne $msg.body.content) { $hasChanged = $true }
            
            if ($hasChanged) {
                $shouldSave = $true
                Write-Host "Updated message center item: $($msg.Id) - $($msg.Title)"
            }
        }
        catch {
            # If we can't read the existing file, save the new one
            $shouldSave = $true
            Write-Warning "Could not read existing file $filePath, will overwrite: $($_.Exception.Message)"
        }
    } else {
        # New file
        $shouldSave = $true
        Write-Host "New message center item: $($msg.Id) - $($msg.Title)"
    }
    
    if ($shouldSave) {
        $msg | ConvertTo-Json -Depth 10 | Set-Content -Path $filePath
        $newOrUpdatedMCCount++
    }
}

Write-Host "Message Center processing complete: $newOrUpdatedMCCount new or updated items out of $($msgItems.Count) total"

# Process Roadmap items - save each one individually for version history (only if changed or new)
$newOrUpdatedCount = 0
foreach($roadmap in $roadmapItems){
    $filePath = "$($dataPath)/rm-archive/$($roadmap.Id).json"
    $shouldSave = $false
    
    if (Test-Path $filePath) {
        # File exists, check if content has changed
        try {
            $existingContent = Get-Content $filePath -Raw | ConvertFrom-Json
            
            # Compare key fields that would indicate a real change
            $hasChanged = $false
            
            if ($existingContent.Title -ne $roadmap.Title) { $hasChanged = $true }
            if ($existingContent.Description -ne $roadmap.Description) { $hasChanged = $true }
            if ($existingContent.PubDate -ne $roadmap.PubDate) { $hasChanged = $true }
            
            # For Services field, handle both string and array formats
            $existingServices = $existingContent.Services
            $newServices = $roadmap.Services
            
            # Convert both to comparable formats for comparison
            $existingServicesStr = if ($existingServices -is [array]) {
                ($existingServices | Sort-Object) -join ","
            } else {
                $existingServices.ToString()
            }
            
            $newServicesStr = if ($newServices -is [array]) {
                ($newServices | Sort-Object) -join ","
            } else {
                $newServices.ToString()
            }
            
            if ($existingServicesStr -ne $newServicesStr) { 
                $hasChanged = $true 
            }
            
            if ($hasChanged) {
                $shouldSave = $true
                Write-Host "Updated roadmap item: $($roadmap.Id) - $($roadmap.Title)"
            }
        }
        catch {
            # If we can't read the existing file, save the new one
            $shouldSave = $true
            Write-Warning "Could not read existing file $filePath, will overwrite: $($_.Exception.Message)"
        }
    } else {
        # New file
        $shouldSave = $true
        Write-Host "New roadmap item: $($roadmap.Id) - $($roadmap.Title)"
    }
    
    if ($shouldSave) {
        $roadmap | ConvertTo-Json -Depth 10 | Set-Content -Path $filePath
        $newOrUpdatedCount++
    }
}

Write-Host "Roadmap processing complete: $newOrUpdatedCount new or updated items out of $($roadmapItems.Count) total"

# Save Message Center data
$msgitems | ConvertTo-Json -Depth 10 | Set-Content -Path ($dataPath + "/messages.json")
$msgitems.Services | Sort-Object | Get-Unique | ConvertTo-Json | Set-Content -Path ($dataPath + "/services.json")

# Save Roadmap data
$roadmapItems | ConvertTo-Json -Depth 10 | Set-Content -Path ($dataPath + "/roadmap.json")

Write-Host "Completed updating"
