# MinIO Community Edition (AGPLv3) untuk penyimpanan berkas bukti EPSS.
#
# Image dan binary resmi MinIO Community sudah tidak diterbitkan (Docker Hub hilang,
# dl.min.io membalas 410), jadi MinIO dan mc dibangun dari source pada tag rilis
# yang dikunci. Commit diverifikasi supaya tag yang dipindah tidak ikut terbangun.
#
# Build (dari root repo):
#   docker build -t epss-minio:RELEASE.2025-10-15T17-29-55Z docker/minio
#
# RELEASE.2025-10-15T17-29-55Z adalah rilis Community terakhir dan sudah memuat
# perbaikan CVE-2025-62506. Proyek upstream berstatus maintenance: pantau CVE sendiri.

# Go yang masih menerima patch keamanan (go.mod MinIO minimal 1.24)
ARG GO_IMAGE=golang:1.26-alpine
ARG RUNTIME_IMAGE=alpine:3.23

FROM ${GO_IMAGE} AS build

ARG MINIO_TAG=RELEASE.2025-10-15T17-29-55Z
ARG MINIO_COMMIT=9e49d5e7a648f00e26f2246f4dc28e6b07f8c84a
ARG MC_TAG=RELEASE.2025-08-13T08-35-41Z
ARG MC_COMMIT=7394ce0dd2a80935aded936b09fa12cbb3cb8096

ENV CGO_ENABLED=0 \
    GOTOOLCHAIN=local \
    GOFLAGS=-mod=readonly

RUN apk add --no-cache git ca-certificates

WORKDIR /src

# gen-ldflags.go membaca riwayat git untuk versi dan commit id, jadi clone (bukan arsip zip)
RUN git clone --depth 1 --branch "${MINIO_TAG}" https://github.com/minio/minio.git minio \
 && test "$(git -C minio rev-parse HEAD)" = "${MINIO_COMMIT}" \
 && git clone --depth 1 --branch "${MC_TAG}" https://github.com/minio/mc.git mc \
 && test "$(git -C mc rev-parse HEAD)" = "${MC_COMMIT}"

# MINIO_RELEASE/MC_RELEASE membuat versi berlabel RELEASE.* (tanpa ini tercetak DEVELOPMENT.*)
RUN cd minio \
 && export MINIO_RELEASE=RELEASE MC_RELEASE=RELEASE \
 && go build -tags kqueue -trimpath -ldflags "$(go run buildscripts/gen-ldflags.go)" -o /out/minio \
 && cd ../mc \
 && go build -tags kqueue -trimpath -ldflags "$(go run buildscripts/gen-ldflags.go)" -o /out/mc \
 && /out/minio --version \
 && /out/mc --version \
 && cp /src/minio/LICENSE /out/LICENSE \
 && cp /src/minio/CREDITS /out/CREDITS

FROM ${RUNTIME_IMAGE}

ARG MINIO_TAG=RELEASE.2025-10-15T17-29-55Z

LABEL org.opencontainers.image.title="epss-minio" \
      org.opencontainers.image.version="${MINIO_TAG}" \
      org.opencontainers.image.source="https://github.com/minio/minio" \
      org.opencontainers.image.licenses="AGPL-3.0-only"

RUN apk add --no-cache ca-certificates tzdata \
 && addgroup -S -g 1000 minio \
 && adduser -S -D -H -u 1000 -G minio -s /sbin/nologin minio \
 && mkdir -p /data /home/minio/.mc \
 && chown -R minio:minio /data /home/minio

COPY --from=build /out/minio /out/mc /usr/bin/
COPY --from=build /out/LICENSE /out/CREDITS /licenses/

# Volume bernama yang baru dibuat mewarisi pemilik /data (minio), jadi server tidak perlu root
USER minio
ENV HOME=/home/minio \
    MC_CONFIG_DIR=/home/minio/.mc

EXPOSE 9000 9001
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:9000/minio/health/live || exit 1

ENTRYPOINT ["/usr/bin/minio"]
CMD ["server", "/data", "--address", ":9000", "--console-address", ":9001"]
