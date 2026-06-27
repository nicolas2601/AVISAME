# Backend Django - AvisameAccasoft
# Imagen simple pensada para despliegue rápido y pruebas locales

FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Dependencias del sistema para PostgreSQL (psycopg2-binary) y compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Instalamos uv como gestor (ya lo usas en el proyecto)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app

# Sólo pyproject/lock para aprovechar la cache de dependencias
COPY pyproject.toml uv.lock ./

# Instalamos dependencias de producción
RUN uv sync --frozen --no-dev

# Copiamos el código del backend
COPY . .

ENV DJANGO_SETTINGS_MODULE=config.settings \
    PORT=8000

EXPOSE 8000

# Para un entorno productivo serio sería mejor gunicorn/uvicorn.
# Aquí dejamos runserver para MVP y facilidad de pruebas.
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
