# Script para baixar imagens de exemplo para o projeto Usekomka
# Executar no PowerShell dentro da pasta do projeto:
# .\scripts\download-images.ps1

$images = @(
    @{ url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80'; out = 'images/beach.jpg' },
    @{ url = 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=600&q=80'; out = 'images/palm-left.png' },
    @{ url = 'https://images.unsplash.com/photo-1501601983405-7c7cabaa1581?auto=format&fit=crop&w=600&q=80'; out = 'images/palm-right.png' }
)

foreach($i in $images){
    Write-Host "Baixando $($i.url) -> $($i.out)"
    try{
        Invoke-WebRequest -Uri $i.url -OutFile $i.out -UseBasicParsing -Headers @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT)'; 'Accept' = 'image/*' }
        Write-Host "Salvo $($i.out)"
    } catch{
        Write-Host "Falha ao baixar $($i.url): $_" -ForegroundColor Red
    }
}

Write-Host "Concluído. Verifique a pasta images/ para os arquivos baixados."