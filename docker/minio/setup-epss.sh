#!/bin/sh
# Setup sekali jalan: bucket privat + user aplikasi Laravel yang hanya boleh mengakses bucket itu.
# Aman diulang (idempoten). Jalankan di dalam container MinIO; akun root dibaca dari env container
# (.env.minio), jadi cukup kirim kredensial user aplikasi:
#
#   export EPSS_APP_ACCESS_KEY=epss-app EPSS_APP_SECRET_KEY=<acak-minimal-16-karakter>
#   docker exec -i -e EPSS_BUCKET=epss-bukti -e EPSS_APP_ACCESS_KEY -e EPSS_APP_SECRET_KEY \
#     epss-minio sh < docker/minio/setup-epss.sh
#
# Isi .env Laravel dengan EPSS_APP_ACCESS_KEY / EPSS_APP_SECRET_KEY, bukan akun root.
set -eu

: "${MINIO_ROOT_USER:?MINIO_ROOT_USER wajib diisi}"
: "${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD wajib diisi}"
: "${EPSS_APP_ACCESS_KEY:?EPSS_APP_ACCESS_KEY wajib diisi}"
: "${EPSS_APP_SECRET_KEY:?EPSS_APP_SECRET_KEY wajib diisi (minimal 8 karakter)}"
BUCKET="${EPSS_BUCKET:-epss-bukti}"
ENDPOINT="${MINIO_ENDPOINT:-http://127.0.0.1:9000}"
POLICY="epss-app-${BUCKET}"

mc alias set epss "$ENDPOINT" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null

# Bucket privat (tanpa akses anonim) dengan versioning sebagai jaring pengaman salah hapus
mc mb --ignore-existing "epss/${BUCKET}"
mc anonymous set none "epss/${BUCKET}" >/dev/null
mc version enable "epss/${BUCKET}"

# Izin minimum yang dipakai Laravel: list, baca, tulis, hapus objek di bucket ini saja
cat > /tmp/epss-policy.json <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::${BUCKET}"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::${BUCKET}/*"]
    }
  ]
}
JSON

mc admin policy create epss "$POLICY" /tmp/epss-policy.json >/dev/null
rm -f /tmp/epss-policy.json

# user add juga memperbarui secret bila user sudah ada
mc admin user add epss "$EPSS_APP_ACCESS_KEY" "$EPSS_APP_SECRET_KEY" >/dev/null
mc admin policy attach epss "$POLICY" --user "$EPSS_APP_ACCESS_KEY" >/dev/null 2>&1 || true

mc alias remove epss >/dev/null

echo "Siap: bucket ${BUCKET} (privat, versioning aktif), user aplikasi ${EPSS_APP_ACCESS_KEY} dengan policy ${POLICY}."
