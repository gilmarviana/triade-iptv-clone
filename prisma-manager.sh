#!/bin/bash

# Script de Gerenciamento do Prisma
# Uso: ./prisma-manager.sh [comando]

case "$1" in
    "studio")
        echo "🎨 Iniciando Prisma Studio..."
        npx prisma studio
        ;;
    "migrate")
        echo "🔄 Criando nova migração..."
        read -p "Nome da migração: " name
        npx prisma migrate dev --name "$name"
        ;;
    "generate")
        echo "⚡ Regenerando cliente Prisma..."
        npx prisma generate
        ;;
    "reset")
        echo "⚠️  ATENÇÃO: Isso vai apagar todos os dados!"
        read -p "Tem certeza? (s/N): " confirm
        if [[ $confirm == [sS] ]]; then
            npx prisma migrate reset
        else
            echo "Operação cancelada."
        fi
        ;;
    "push")
        echo "📤 Sincronizando schema com banco..."
        npx prisma db push
        ;;
    "seed")
        echo "🌱 Executando seeds..."
        npx prisma db seed
        ;;
    "backup")
        echo "💾 Fazendo backup do banco..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        cp prisma/dev.db "backup_${timestamp}.db"
        echo "Backup salvo como: backup_${timestamp}.db"
        ;;
    "status")
        echo "📊 Status do banco de dados:"
        npx prisma migrate status
        ;;
    *)
        echo "🛠️  Gerenciador Prisma - Comandos disponíveis:"
        echo "  studio   - Abrir interface visual"
        echo "  migrate  - Criar nova migração"
        echo "  generate - Regenerar cliente"
        echo "  reset    - Reset completo do banco"
        echo "  push     - Sincronizar schema"
        echo "  seed     - Executar seeds"
        echo "  backup   - Fazer backup"
        echo "  status   - Ver status das migrações"
        echo ""
        echo "Uso: $0 [comando]"
        ;;
esac
