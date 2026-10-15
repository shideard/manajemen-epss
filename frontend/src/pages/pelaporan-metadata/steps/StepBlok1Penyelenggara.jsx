function StepBlok1Penyelenggara({ formData, updateBlok1 }) {
  const data = formData.blok1

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-grey-50 pb-3">
        <h2 className="text-[18px] font-bold text-grey-300">I. PENYELENGGARA</h2>
        <p className="text-[13px] text-grey-100">Informasi identitas instansi penyelenggara kegiatan statistik.</p>
      </div>

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-5">
        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-1.5">
            1.1. Instansi Penyelenggara <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nama Instansi Penyelenggara (mis. Dinas Komunikasi dan Informatika)"
            value={data.instansiPenyelenggara}
            onChange={(e) => updateBlok1('instansiPenyelenggara', e.target.value)}
            className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 focus:ring-1 focus:ring-grey-300 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-[14px] font-bold text-grey-300 mb-1.5">
            1.2. Alamat Lengkap Instansi Penyelenggara <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Alamat lengkap instansi penyelenggara"
            value={data.alamat}
            onChange={(e) => updateBlok1('alamat', e.target.value)}
            className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 focus:ring-1 focus:ring-grey-300 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[14px] font-bold text-grey-300 mb-1.5">Telepon</label>
            <input
              type="text"
              placeholder="Telepon instansi"
              value={data.telepon}
              onChange={(e) => updateBlok1('telepon', e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[14px] font-bold text-grey-300 mb-1.5">Faksimile</label>
            <input
              type="text"
              placeholder="Faksimile instansi"
              value={data.faksimile}
              onChange={(e) => updateBlok1('faksimile', e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[14px] font-bold text-grey-300 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Email instansi"
              value={data.email}
              onChange={(e) => updateBlok1('email', e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok1Penyelenggara
