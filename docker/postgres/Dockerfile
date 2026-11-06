FROM postgres:17.11-bookworm@sha256:665dc7b37ac52a17e298511414c21d23ffa4e6a6ef6225b3e5d59c7afb35e994

# The official entrypoint only uses gosu when started as root.
RUN apt-get update && apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/* /usr/local/bin/gosu

USER postgres
