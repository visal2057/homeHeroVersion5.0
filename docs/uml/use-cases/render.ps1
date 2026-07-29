# Renders every .puml in this folder to PNG and SVG under ./out
# Usage:  powershell -ExecutionPolicy Bypass -File render.ps1
#
# Requires: Java (any recent version) and plantuml.jar in this folder.
# Graphviz is NOT required - PlantUML's built-in layout engines are used.
#
# Layout engine per diagram (chosen by comparing actual output):
#   00-system-overview  -> elk     (packages + many cross-module links; smetana clips them)
#   module diagrams     -> smetana (more compact, closer to page aspect ratio)

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$jar  = Join-Path $here 'plantuml.jar'
$out  = Join-Path $here 'out'

if (-not (Test-Path $jar)) {
    Write-Error "plantuml.jar not found in $here. Download it from https://github.com/plantuml/plantuml/releases and place it here."
    exit 1
}

if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$overview = Join-Path $here '00-system-overview.puml'
$modules  = Get-ChildItem -Path $here -Filter '*.puml' |
            Where-Object { $_.Name -ne '00-system-overview.puml' } |
            ForEach-Object { $_.FullName }

foreach ($fmt in @('png', 'svg')) {
    Write-Host "Rendering $($fmt.ToUpper())..."
    & java -jar $jar -Playout=elk     "-t$fmt" -o $out $overview
    & java -jar $jar -Playout=smetana "-t$fmt" -o $out $modules
}

Write-Host "Done. Output in $out"
Get-ChildItem $out | Select-Object Name, Length
