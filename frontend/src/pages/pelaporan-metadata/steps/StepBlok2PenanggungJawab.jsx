function StepBlok2PenanggungJawab({ formData, updateBlok2 }) {
  const data = formData.blok2

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-grey-50 pb-3">
        <h2 className="text-[18px] font-bold text-grey-300">II. PENANGGUNG JAWAB</h2>
        <p className="text-[13px] text-grey-100">Pejabat struktural dan penanggung jawab teknis kegiatan statistik.</p>
      </div>

      <div className="rounded-2xl border border-grey-50 bg-white p-7 shadow-xs flex flex-col gap-6">
        <div>
          <h3 className="text-[15px] font-bold text-grey-300 mb-3">2.1. Unit Eselon Penanggung Jawab</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-grey-200 mb-1">Eselon 1</label>
              <input
                type="text"
                placeholder="Tuliskan nama unit penanggung jawab setingkat Eselon 1"
                value={data.eselon1}
                onChange={(e) => updateBlok2('eselon1', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-grey-200 mb-1">Eselon 2</label>
              <input
                type="text"
                placeholder="Tuliskan nama unit penanggung jawab setingkat Eselon 2"
                value={data.eselon2}
                onChange={(e) => updateBlok2('eselon2', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-grey-50 pt-5">
          <h3 className="text-[15px] font-bold text-grey-300 mb-3">2.2. Penanggung Jawab Teknis (setingkat Eselon 3)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-grey-200 mb-1">Nama</label>
              <input
                type="text"
                placeholder="Tuliskan nama penanggung jawab teknis"
                value={data.teknisNama}
                onChange={(e) => updateBlok2('teknisNama', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-grey-200 mb-1">Jabatan</label>
              <input
                type="text"
                placeholder="Tuliskan jabatan penanggung jawab teknis"
                value={data.teknisJabatan}
                onChange={(e) => updateBlok2('teknisJabatan', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[13px] font-semibold text-grey-200 mb-1">Alamat</label>
            <input
              type="text"
              placeholder="Tuliskan alamat penanggung jawab teknis"
              value={data.teknisAlamat}
              onChange={(e) => updateBlok2('teknisAlamat', e.target.value)}
              className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-[13px] font-semibold text-grey-200 mb-1">Telepon</label>
              <input
                type="text"
                placeholder="Telepon"
                value={data.teknisTelepon}
                onChange={(e) => updateBlok2('teknisTelepon', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-grey-200 mb-1">Faksimile</label>
              <input
                type="text"
                placeholder="Faksimile"
                value={data.teknisFaksimile}
                onChange={(e) => updateBlok2('teknisFaksimile', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-grey-200 mb-1">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={data.teknisEmail}
                onChange={(e) => updateBlok2('teknisEmail', e.target.value)}
                className="w-full rounded-xl border border-grey-75/60 px-4 py-2.5 text-[14px] text-grey-300 focus:border-grey-300 outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepBlok2PenanggungJawab
