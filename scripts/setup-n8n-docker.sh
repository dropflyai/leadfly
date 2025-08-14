#!/bin/bash

# LeadFly AI - n8n Docker Setup Script
# Sets up n8n with proper configuration for LeadFly automation

set -e

echo "🚀 Setting up n8n for LeadFly AI Automation"
echo "=========================================="

# Configuration
N8N_VERSION=${N8N_VERSION:-"latest"}
N8N_PORT=${N8N_PORT:-5678}
N8N_DATA_DIR=${N8N_DATA_DIR:-"$HOME/.n8n"}
LEADFLY_API_URL=${LEADFLY_API_URL:-"https://leadfly-ai.vercel.app"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_warning "docker-compose not found. Using 'docker compose' instead."
    fi
    
    log_success "Prerequisites check passed"
}

# Create n8n data directory
create_data_directory() {
    log_info "Creating n8n data directory..."
    
    mkdir -p "$N8N_DATA_DIR"
    chmod 755 "$N8N_DATA_DIR"
    
    log_success "Data directory created: $N8N_DATA_DIR"
}

# Generate secure API key
generate_api_key() {
    if [[ -z "$N8N_API_KEY" ]]; then
        N8N_API_KEY=$(openssl rand -hex 32)
        log_info "Generated secure n8n API key"
    fi
}

# Generate secure encryption key
generate_encryption_key() {
    if [[ -z "$N8N_ENCRYPTION_KEY" ]]; then
        N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
        log_info "Generated secure encryption key"
    fi
}

# Create docker-compose.yml
create_docker_compose() {
    log_info "Creating docker-compose configuration..."
    
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:${N8N_VERSION}
    container_name: leadfly-n8n
    restart: unless-stopped
    ports:
      - "${N8N_PORT}:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=\${N8N_BASIC_AUTH_USER:-admin}
      - N8N_BASIC_AUTH_PASSWORD=\${N8N_BASIC_AUTH_PASSWORD}
      - N8N_HOST=\${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=\${N8N_PROTOCOL:-http}
      - WEBHOOK_URL=\${WEBHOOK_URL:-http://localhost:5678/}
      - N8N_API_KEY=\${N8N_API_KEY}
      - N8N_ENCRYPTION_KEY=\${N8N_ENCRYPTION_KEY}
      - DB_TYPE=sqlite
      - DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console
      - N8N_METRICS=true
      # LeadFly specific environment variables
      - LEADFLY_API_URL=\${LEADFLY_API_URL}
      - LEADFLY_API_KEY=\${LEADFLY_API_KEY}
      - NODE_ENV=production
      # Increase memory limit for processing
      - NODE_OPTIONS=--max_old_space_size=4096
    volumes:
      - ${N8N_DATA_DIR}:/home/node/.n8n
      - /var/run/docker.sock:/var/run/docker.sock
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Redis for high-performance task queuing
  redis:
    image: redis:7-alpine
    container_name: leadfly-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  redis_data:
    driver: local

networks:
  default:
    name: leadfly-network
    driver: bridge
EOF
    
    log_success "Docker Compose configuration created"
}

# Create environment file
create_env_file() {
    log_info "Creating environment file..."
    
    cat > .env << EOF
# n8n Configuration
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD:-$(openssl rand -base64 32)}
N8N_HOST=${N8N_HOST:-localhost}
N8N_PROTOCOL=${N8N_PROTOCOL:-http}
WEBHOOK_URL=${WEBHOOK_URL:-http://localhost:5678/}
N8N_API_KEY=${N8N_API_KEY}
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}

# LeadFly Configuration
LEADFLY_API_URL=${LEADFLY_API_URL}
LEADFLY_API_KEY=${LEADFLY_API_KEY:-your-leadfly-api-key-here}

# Optional: Slack/Teams webhook URLs for notifications
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
# TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK
EOF
    
    log_success "Environment file created (.env)"
    log_warning "Please update LEADFLY_API_KEY in .env file with your actual API key"
}

# Start n8n
start_n8n() {
    log_info "Starting n8n containers..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    log_success "n8n started successfully"
    log_info "Waiting for n8n to be ready..."
    
    # Wait for health check
    for i in {1..30}; do
        if curl -f http://localhost:${N8N_PORT}/healthz &> /dev/null; then
            log_success "n8n is ready!"
            break
        fi
        sleep 2
        if [ $i -eq 30 ]; then
            log_error "n8n failed to start within 60 seconds"
            exit 1
        fi
    done
}

# Install Node.js dependencies for deployment script
install_dependencies() {
    log_info "Installing deployment script dependencies..."
    
    if [ ! -f package.json ]; then
        cat > package.json << EOF
{
  "name": "leadfly-n8n-deployment",
  "version": "1.0.0",
  "description": "LeadFly AI n8n deployment tools",
  "scripts": {
    "deploy": "node scripts/deploy-n8n-workflows.js"
  },
  "dependencies": {
    "axios": "^1.6.0"
  }
}
EOF
    fi
    
    if command -v npm &> /dev/null; then
        npm install
        log_success "Dependencies installed"
    else
        log_warning "npm not found. Please install Node.js and run 'npm install' manually"
    fi
}

# Deploy workflows
deploy_workflows() {
    log_info "Deploying LeadFly workflows to n8n..."
    
    if [ -f "scripts/deploy-n8n-workflows.js" ] && command -v node &> /dev/null; then
        # Wait a bit more for n8n to be fully ready
        sleep 5
        
        export N8N_URL="http://localhost:${N8N_PORT}"
        node scripts/deploy-n8n-workflows.js
        
        if [ $? -eq 0 ]; then
            log_success "Workflows deployed successfully"
        else
            log_warning "Workflow deployment failed. You can run it manually later."
        fi
    else
        log_warning "Deployment script not found or Node.js not available"
        log_info "You can deploy workflows manually using the n8n interface"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "🎉 LeadFly n8n Setup Complete!"
    echo "=================================="
    echo ""
    echo "📊 Access n8n interface:"
    echo "   URL: http://localhost:${N8N_PORT}"
    echo "   Username: admin"
    echo "   Password: (check .env file)"
    echo ""
    echo "🔗 Webhook Endpoints:"
    echo "   New Leads: http://localhost:${N8N_PORT}/webhook/leadfly/webhook/new-lead"
    echo "   Email Engagement: http://localhost:${N8N_PORT}/webhook/leadfly/webhook/email-engagement"
    echo ""
    echo "🔧 Configuration Files:"
    echo "   Docker Compose: docker-compose.yml"
    echo "   Environment: .env"
    echo "   Data Directory: ${N8N_DATA_DIR}"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Update LEADFLY_API_KEY in .env file"
    echo "   2. Configure your email providers to use the webhook endpoints"
    echo "   3. Test the automation by sending sample data"
    echo "   4. Monitor workflows in the n8n interface"
    echo ""
    echo "🛠️  Management Commands:"
    echo "   Start: docker-compose up -d"
    echo "   Stop: docker-compose down"
    echo "   Logs: docker-compose logs -f n8n"
    echo "   Restart: docker-compose restart n8n"
    echo ""
}

# Main execution
main() {
    echo "🎯 Starting LeadFly n8n setup..."
    
    check_prerequisites
    create_data_directory
    generate_api_key
    generate_encryption_key
    create_docker_compose
    create_env_file
    install_dependencies
    start_n8n
    deploy_workflows
    print_summary
    
    log_success "Setup completed successfully!"
}

# Run main function
main "$@"