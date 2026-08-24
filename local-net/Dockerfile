# 9Chain-A1 node — build bản avalanchego đã rebrand thành 9chaingo.
# Rebrand được áp NGAY TRONG build (idempotent) => image tái lập được, không
# phụ thuộc việc source trên đĩa đã patch hay chưa.
#
# Build context = thư mục gốc dự án (C:\PROJECTS\9Chain-A1).
#   docker build -f local-net/Dockerfile -t 9chain-a1/node:dev .
#
ARG GO_VERSION=1.25.10

# ============ Build stage ============
FROM golang:${GO_VERSION}-bookworm AS builder
WORKDIR /build

# Nguồn: bản fork avalanchego (đã kèm graft/coreth + graft/subnet-evm)
COPY upstream/avalanchego/ ./
# Script rebrand identity của 9Chain-A1
COPY scripts/rebrand.sh /tmp/rebrand.sh

# Áp lớp identity 9Chain-A1 (Client name, token LOVE9, HRP love9) — chỉ đổi VALUE.
RUN bash /tmp/rebrand.sh .

# Build node (build.sh xuất binary ra ./build/).
# AVALANCHEGO_COMMIT bỏ qua bước `git rev-parse` (build context không có .git).
ARG A1_COMMIT=9chain-a1-poc
RUN export CC=gcc && AVALANCHEGO_COMMIT="${A1_COMMIT}" ./scripts/build.sh

# Build subnet-evm thành plugin VM cho L1 EVM của 9Chain-A1 (VMID = love9evm).
# Build ra path tạm (tránh build.sh symlink file vào chính nó), rồi copy binary
# THẬT vào build/plugins/<VMID> để node tự nạp khi chạy.
ARG LOVE9EVM_VMID=pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf
RUN export CC=gcc && AVALANCHEGO_COMMIT="${A1_COMMIT}" \
    ./graft/subnet-evm/scripts/build.sh /tmp/love9evm-plugin && \
    mkdir -p /build/build/plugins && \
    rm -f "/build/build/plugins/${LOVE9EVM_VMID}" && \
    cp /tmp/love9evm-plugin "/build/build/plugins/${LOVE9EVM_VMID}" && \
    echo "plugin installed:" && ls -l "/build/build/plugins/${LOVE9EVM_VMID}"

# Build các tool overlay vào image: create-l1, 9chain-a1-cli, xp-wallet.
RUN export CC=gcc AVALANCHEGO_COMMIT="${A1_COMMIT}" && \
    go build -o /build/build/create-l1 ./9chain-a1-tools/create-l1 && \
    go build -o /build/build/9chain-a1-cli ./9chain-a1-tools/9chain-a1-cli && \
    go build -o /build/build/xp-wallet ./9chain-a1-tools/xp-wallet

# ============ Runtime stage ============
FROM debian:12-slim AS execution
# curl là BẮT BUỘC: healthcheck của compose gọi HTTP. debian-slim KHÔNG có sẵn
# wget/curl -> nếu thiếu, container bị gắn cờ "unhealthy" dù node hoàn toàn khoẻ.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/build/ /9chain-a1/build/
WORKDIR /9chain-a1/build
EXPOSE 9650 9651
CMD ["./avalanchego"]
