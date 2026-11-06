FROM postgres:17.11-bookworm@sha256:665dc7b37ac52a17e298511414c21d23ffa4e6a6ef6225b3e5d59c7afb35e994

# PostgreSQL runs as postgres and does not need the base image's gosu, GnuPG or SQLite.
RUN apt-get update && apt-get upgrade -y && \
    apt-get purge -y --no-auto-remove --no-download gpg libsqlite3-0 && \
    rm -rf /var/lib/apt/lists/* /usr/local/bin/gosu

USER postgres
