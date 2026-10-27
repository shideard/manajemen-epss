import { Notice, PageHeader } from '../../components/ui'

// ponytail: masih kosong; nanti tampilan ala Google Drive berisi semua file bukti yang sudah diunggah beserta kegiatan tautannya
function ArsipBukti() {
  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader title="Repositori Bukti Dukung" subtitle="Arsip semua file bukti dukung yang sudah diunggah beserta kegiatan yang tertaut." />
      <Notice tone="blue">Halaman ini sedang disiapkan.</Notice>
    </div>
  )
}

export default ArsipBukti
