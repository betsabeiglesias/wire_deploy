COMPOSE_FILE = docker-compose.yml
COMPOSE_PROD = docker compose -f docker-compose.prod.yml

GREEN = \033[0;32m
CYAN = \033[0;36m
RESET = \033[0m

all: up build

up: 
	@printf "$(CYAN)[INFO] Building docker compose...$(RESET)"
	docker compose -f $(COMPOSE_FILE) up -d
	@printf "$(CYAN)[OK] Containers running.$(RESET)"

build:
	@printf "$(CYAN)[INFO] Building docker compose...$(RESET)"
	docker compose -f $(COMPOSE_FILE) build
	@printf "$(CYAN)[OK] Containers running.$(RESET)"

down:
	@printf "$(CYAN)[INFO] Stopping containers (keeping volumes)...$(RESET)"
	docker compose -f $(COMPOSE_FILE) down
	@printf "$(GREEN)[OK] Containers stopped. Data preserved.$(RESET)"

restart:
	$(COMPOSE_FILE) restart

logs:
	$(COMPOSE_FILE) logs -f

ps:
	$(COMPOSE_FILE) ps

clean:
	$(COMPOSE_FILE) down -v --remove-orphans

# --- PRODUCCIÓN ---

prod:
	$(COMPOSE_PROD) up -d

prod-build:
	$(COMPOSE_PROD) up -d --build

prod-down:
	$(COMPOSE_PROD) down


.PHONY: up down build logs ps restart clean prod
