FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /pb

# Download PocketBase 0.36.5 Linux AMD64
RUN curl -fsSL "https://github.com/pocketbase/pocketbase/releases/download/v0.36.5/pocketbase_0.36.5_linux_amd64.zip" \
    -o pocketbase.zip \
    && unzip pocketbase.zip \
    && rm pocketbase.zip \
    && chmod +x pocketbase

# Copy migrations so the schema is auto-applied on first boot
COPY pb_migrations/ /pb/pb_migrations/

COPY entrypoint.sh /pb/entrypoint.sh
RUN chmod +x /pb/entrypoint.sh

EXPOSE 8090

ENTRYPOINT ["/pb/entrypoint.sh"]
