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
            [xml]$rssContent = $response.Content
            $roadmapItems = @()
            
            foreach ($item in $rssContent.rss.channel.item) {
                $roadmapItem = @{
                    Id = "ROADMAP_$($item.guid.'#text')"
                    Title = $item.title
                    Description = $item.description
                    Link = $item.link
                    PubDate = $item.pubDate
                    Categories = @($item.category)
                    Services = @("Microsoft 365 Roadmap") # Default service, could be enhanced
                    Type = "roadmap"
                }
                $roadmapItems += $roadmapItem
            }
            
            Write-Host "Found $($roadmapItems.Count) roadmap items"
            return $roadmapItems
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
