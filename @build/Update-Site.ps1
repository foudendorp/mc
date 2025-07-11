# Get the latest M365 Message Center items and update the site

param($GraphSecret)
function Connect-MicrosoftGraph(){
    $m365Config = Get-Content ./@build/config-m365.json | ConvertFrom-Json

    $secret = $GraphSecret
    if([string]::IsNullOrEmpty($GraphSecret)){ # If we are running in Github get the secret from the parameter
        Write-Host "-GraphSecret not supplied"
        $secret = Get-Content ./@build/secrets-m365.json | ConvertFrom-Json
    }

    [securestring]$secSecret = ConvertTo-SecureString $secret -AsPlainText -Force
    [pscredential]$cred = New-Object System.Management.Automation.PSCredential ($m365Config.clientId, $secSecret)
    Write-Host "Connecting to Microsoft Graph"
    Connect-MgGraph -TenantId $m365Config.tenantId -Credential $cred -NoWelcome
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
                        if ($itemCount -gt 50) { break } # Limit to first 50 items for performance
                        
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
                            elseif ($catLower -like "*exchange*") { $services += "Exchange Online" }
                            elseif ($catLower -like "*outlook*") { $services += "Outlook" }
                            elseif ($catLower -like "*onedrive*") { $services += "OneDrive for Business" }
                            elseif ($catLower -like "*copilot*") { $services += "Microsoft Copilot" }
                            elseif ($catLower -like "*viva*") { $services += "Microsoft Viva" }
                            elseif ($catLower -like "*purview*") { $services += "Microsoft Purview" }
                            elseif ($catLower -like "*word*") { $services += "Microsoft 365 Apps" }
                            elseif ($catLower -like "*excel*") { $services += "Microsoft 365 Apps" }
                            elseif ($catLower -like "*powerpoint*") { $services += "Microsoft 365 Apps" }
                        }
                        
                        # Default to Microsoft 365 Roadmap if no specific service found
                        if ($services.Count -eq 0) {
                            $services = @("Microsoft 365 Roadmap")
                        }
                        
                        # Remove duplicates
                        $services = $services | Sort-Object | Get-Unique
                        
                        # Clean and truncate description
                        $description = $item.description
                        if ($description.Length -gt 500) {
                            $description = $description.Substring(0, 500) + "..."
                        }
                        
                        $roadmapItem = @{
                            Id = "ROADMAP_$($item.guid)"
                            Title = $item.title
                            Description = $description
                            Link = $item.link
                            PubDate = $item.pubDate
                            Categories = $categories
                            Services = $services
                            Type = "roadmap"
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

Connect-MicrosoftGraph
$msgItems = Get-M365MessageCenterItems
$roadmapItems = Get-M365RoadmapItems

Write-Host "Updating site data with $($msgItems.Count) message center items and $($roadmapItems.Count) roadmap items"

# Process Message Center items
foreach($msg in $msgItems){
    $msg.Title = $msg.Title.Replace('(Updated) ', '')
    $msg.body.content = $msg.body.content -replace '\[(.*?)\]', '<b>$1</b>'

    # Save each message for version history
    $msg | ConvertTo-Json -Depth 10 | Set-Content -Path ("$($dataPath)/archive/$($msg.Id).json")
}

# Save Message Center data
$msgitems | ConvertTo-Json -Depth 10 | Set-Content -Path ($dataPath + "/messages.json")
$msgitems.Services | Sort-Object | Get-Unique | ConvertTo-Json | Set-Content -Path ($dataPath + "/services.json")

# Save Roadmap data
$roadmapItems | ConvertTo-Json -Depth 10 | Set-Content -Path ($dataPath + "/roadmap.json")

Write-Host "Completed updating"
