ARG MONGO_VERSION
FROM mongo:${MONGO_VERSION}

# Copia o script para dentro da imagem
COPY entrypoint.sh /entrypoint.sh

# Dá permissão de execução
RUN chmod +x /entrypoint.sh

# Usa o script como ponto de entrada
ENTRYPOINT ["/entrypoint.sh"]
