# Script de Gerenciamento do Prisma para Windows
# Uso: .\prisma-manager.ps1 [comando]

param(
    [string]$Command = "help"
)

switch ($Command) {
    "studio" {
        Write-Host "🎨 Iniciando Prisma Studio..." -ForegroundColor Green
        npx prisma studio
    }
    "migrate" {
        Write-Host "🔄 Criando nova migração..." -ForegroundColor Yellow
        $name = Read-Host "Nome da migração"
        npx prisma migrate dev --name $name
    }
    "generate" {
        Write-Host "⚡ Regenerando cliente Prisma..." -ForegroundColor Cyan
        npx prisma generate
    }
    "reset" {
        Write-Host "⚠️  ATENÇÃO: Isso vai apagar todos os dados!" -ForegroundColor Red
        $confirm = Read-Host "Tem certeza? (s/N)"
        if ($confirm -eq "s" -or $confirm -eq "S") {
            npx prisma migrate reset
        } else {
            Write-Host "Operação cancelada." -ForegroundColor Yellow
        }
    }
    "push" {
        Write-Host "📤 Sincronizando schema com banco..." -ForegroundColor Blue
        npx prisma db push
    }
    "seed" {
        Write-Host "🌱 Executando seeds..." -ForegroundColor Green
        npx prisma db seed
    }
    "backup" {
        Write-Host "💾 Fazendo backup do banco..." -ForegroundColor Magenta
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item "prisma/dev.db" "backup_$timestamp.db"
        Write-Host "Backup salvo como: backup_$timestamp.db" -ForegroundColor Green
    }
    "status" {
        Write-Host "📊 Status do banco de dados:" -ForegroundColor Blue
        npx prisma migrate status
    }
    "servers" {
        Write-Host "🖥️  Visualizando servidores no banco..." -ForegroundColor Cyan
        npx prisma db seed --preview-feature
    }
    default {
        Write-Host "🛠️  Gerenciador Prisma - Comandos disponíveis:" -ForegroundColor White
        Write-Host "  studio   - Abrir interface visual" -ForegroundColor Gray
        Write-Host "  migrate  - Criar nova migração" -ForegroundColor Gray
        Write-Host "  generate - Regenerar cliente" -ForegroundColor Gray
        Write-Host "  reset    - Reset completo do banco" -ForegroundColor Gray
        Write-Host "  push     - Sincronizar schema" -ForegroundColor Gray
        Write-Host "  seed     - Executar seeds" -ForegroundColor Gray
        Write-Host "  backup   - Fazer backup" -ForegroundColor Gray
        Write-Host "  status   - Ver status das migrações" -ForegroundColor Gray
        Write-Host "" 
        Write-Host "Uso: .\prisma-manager.ps1 [comando]" -ForegroundColor White
        Write-Host ""
        Write-Host "Exemplos:" -ForegroundColor Yellow
        Write-Host "  .\prisma-manager.ps1 studio" -ForegroundColor Gray
        Write-Host "  .\prisma-manager.ps1 backup" -ForegroundColor Gray
    }
}
