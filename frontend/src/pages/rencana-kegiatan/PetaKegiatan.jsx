import { useMemo, useRef, useState } from 'react'
import { Background, Controls, Handle, Panel, Position, ReactFlow, useNodesState } from '@xyflow/react'
import { animate } from 'motion/react'
import '@xyflow/react/dist/style.css'
import { PETA, petaRelasi, pilihTingkat, terhubung, WARNA } from '../../lib/epss'
import arrowDown from '../../assets/rencana/arrow-down-s-line.svg'

const JENIS = [
  ['domain', 'Domain'],
  ['aspek', 'Aspek'],
  ['indikator', 'Indikator'],
  ['kegiatan', 'Rencana Kegiatan'],
]
const TITIK = { domain: 'bg-grey-500', aspek: 'bg-grey-200', indikator: 'border border-lime-200 bg-lime-100' }

// Dropdown filter satu tingkat; titik warnanya sama dengan warna kotak tingkat itu di peta
function FilterTingkat({ jenis, judul, value, options, onChange }) {
  return (
    <label className="flex w-full flex-col gap-1.5 sm:w-[250px]">
      <span className="flex items-center gap-1.5 text-small font-semibold text-grey-200">
        <span className={`size-3 rounded-full ${TITIK[jenis]}`} />
        {judul}
      </span>
      <span className="relative flex h-[45px] items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`size-full appearance-none truncate rounded-md bg-grey2-75 pr-12 pl-3.5 text-body focus:outline-2 focus:outline-grey-300 ${
            value ? 'text-grey-500' : 'font-light text-grey-75 italic'
          }`}
        >
          <option value="">Semua {judul.toLowerCase()}</option>
          {options.map((n) => (
            <option key={n.id} value={n.id}>
              {jenis === 'aspek' ? n.data.label : `${n.data.chip} – ${n.data.label}`}
            </option>
          ))}
        </select>
        <img src={arrowDown} alt="" width={24} height={24} className="pointer-events-none absolute right-3.5 rounded-xs bg-grey-300" />
      </span>
    </label>
  )
}

const KELAS = {
  domain: 'bg-grey-500 text-lime-300',
  aspek: 'bg-grey-200 text-white',
  indikator: 'border border-lime-200 bg-lime-100 text-grey-500',
  kegiatan: 'cursor-pointer text-grey-500',
}

// Kartu node; handle disembunyikan karena garis tidak bisa disambung manual. Muncul berurutan per kolom.
function NodePeta({ data }) {
  const { jenis, label, chip, info, kegiatan, kolom, redup, sorot } = data
  return (
    <div
      title={label}
      style={{ background: kegiatan && WARNA[kegiatan.warna], animationDelay: `${kolom * 90}ms` }}
      className={`w-[230px] rounded-sm px-3 py-2 text-small shadow-sm transition-[opacity,scale,box-shadow] duration-200 motion-safe:animate-rise ${KELAS[jenis]} ${
        redup ? 'opacity-25' : ''
      } ${sorot ? 'scale-[1.04] shadow-md' : ''}`}
    >
      {jenis !== 'domain' && <Handle type="target" position={Position.Left} className="opacity-0" />}
      <p className="flex justify-between gap-2 text-caption font-semibold tracking-wide uppercase opacity-70">
        <span className="shrink-0">{chip}</span>
        <span className="truncate">{info}</span>
      </p>
      <p className="mt-1 line-clamp-2 font-semibold">{label}</p>
      {jenis !== 'kegiatan' && <Handle type="source" position={Position.Right} className="opacity-0" />}
    </div>
  )
}

function JudulKolom({ data }) {
  return <p className="w-[230px] text-center text-small font-semibold tracking-wide uppercase">{data.label}</p>
}

const nodeTypes = { peta: NodePeta, judul: JudulKolom }
const JUDUL = ['Domain', 'Aspek', 'Indikator', 'Rencana Kegiatan'].map((label, kolom) => ({
  id: `judul:${kolom}`,
  type: 'judul',
  position: { x: kolom * PETA.kolom, y: -50 },
  draggable: false,
  selectable: false,
  focusable: false,
  data: { label },
}))

// Peta Domain → Aspek → Indikator → Rencana Kegiatan. Filter (atau klik kotak) menandai jalur, hover menyorot
// jalur sementara, node bisa digeser lalu memantul kembali ke tempatnya, klik kegiatan untuk membukanya (sama seperti di kalender).
function PetaKegiatan({ kegiatan, bukti, onOpen }) {
  const awal = useMemo(() => {
    const peta = petaRelasi(kegiatan, bukti)
    return { ...peta, nodes: [...JUDUL, ...peta.nodes.map((n) => ({ ...n, type: 'peta' }))] }
  }, [kegiatan, bukti])
  const [nodes, setNodes, onNodesChange] = useNodesState(awal.nodes)
  const [sumber, setSumber] = useState(awal)
  const [hover, setHover] = useState(null)
  const [filter, setFilter] = useState({ domain: '', aspek: '', indikator: '' }) // id node per tingkat
  const animasi = useRef(new Map()) // id node → animasi kembalinya

  // Kegiatan/pemetaan berubah → pakai susunan baru
  if (sumber !== awal) {
    setSumber(awal)
    setNodes(awal.nodes)
  }

  // Yang disorot = tingkat paling bawah yang dipilih
  const pilihan = filter.indikator || filter.aspek || filter.domain
  const pilih = (jenis, id) => setFilter((f) => pilihTingkat(awal.edges, f, jenis, id))

  // Isi dropdown dibatasi oleh tingkat di atasnya yang sudah dipilih
  function opsi(jenis, atas) {
    const turunan = atas && terhubung(awal.edges, atas)
    return awal.nodes.filter((n) => n.data.jenis === jenis && (!turunan || turunan.has(n.id)))
  }

  function mulaiGeser(_, node) {
    animasi.current.get(node.id)?.stop()
    setNodes((ns) => ns.map((n) => (n.type === 'peta' ? { ...n, zIndex: n.id === node.id ? 1 : 0 } : n)))
  }

  function kembali(_, node) {
    const asal = awal.nodes.find((n) => n.id === node.id).position
    const dari = node.position
    const geser = (t) =>
      setNodes((ns) => ns.map((n) => (n.id === node.id ? { ...n, position: { x: dari.x + (asal.x - dari.x) * t, y: dari.y + (asal.y - dari.y) * t } } : n)))
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return geser(1)
    animasi.current.set(node.id, animate(0, 1, { type: 'spring', bounce: 0.45, duration: 0.7, onUpdate: geser }))
  }

  // Hover menyorot sementara di atas filter
  const fokus = hover ?? (pilihan || null)
  const jalur = fokus && terhubung(awal.edges, fokus)
  const ringkasan = jalur && JENIS.map(([jenis, judul]) => `${awal.nodes.filter((n) => n.data.jenis === jenis && jalur.has(n.id)).length} ${judul.toLowerCase()}`).join(' · ')
  const tampilNodes = jalur ? nodes.map((n) => (n.type === 'peta' ? { ...n, data: { ...n.data, redup: !jalur.has(n.id), sorot: n.id === fokus } } : n)) : nodes
  const edges = awal.edges.map((e) => {
    const aktif = jalur?.has(e.source) && jalur.has(e.target)
    return {
      ...e,
      animated: aktif,
      style: {
        stroke: aktif ? 'var(--color-grey-500)' : e.target.startsWith('k:') ? 'var(--color-lime-500)' : 'var(--color-grey-75)',
        strokeWidth: aktif ? 2.5 : 1.5,
        opacity: jalur && !aktif ? 0.12 : 1,
        transition: 'opacity 200ms, stroke 200ms',
      },
    }
  })

  // Tinggi kanvas mengikuti isi peta (termasuk judul kolom), jadi pada zoom 1 tidak perlu digeser ke bawah
  const tinggi = Math.max(...awal.nodes.map((n) => n.position.y)) + 200

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <FilterTingkat jenis="domain" judul="Domain" value={filter.domain} options={opsi('domain')} onChange={(id) => pilih('domain', id)} />
        <FilterTingkat jenis="aspek" judul="Aspek" value={filter.aspek} options={opsi('aspek', filter.domain)} onChange={(id) => pilih('aspek', id)} />
        <FilterTingkat
          jenis="indikator"
          judul="Indikator"
          value={filter.indikator}
          options={opsi('indikator', filter.aspek || filter.domain)}
          onChange={(id) => pilih('indikator', id)}
        />
        {ringkasan && (
          <p role="status" className="pb-3 text-small text-grey-200">
            Jalur: {ringkasan}
          </p>
        )}
      </div>

      <div style={{ height: tinggi }} className="w-full overflow-hidden rounded-lg border-5 border-dashed border-lime-500 bg-lime-50">
        <ReactFlow
          nodes={tampilNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStart={mulaiGeser}
          onNodeDragStop={kembali}
          onNodeMouseEnter={(_, node) => node.type === 'peta' && setHover(node.id)}
          onNodeMouseLeave={() => setHover(null)}
          // Klik kegiatan membukanya; klik domain/aspek/indikator menjadikannya filter (klik lagi untuk melepas)
          onNodeClick={(_, node) => {
            if (node.data.kegiatan) onOpen(node.data.kegiatan)
            else if (node.type === 'peta') pilih(node.data.jenis, node.id === pilihan ? '' : node.id)
          }}
          fitView
          fitViewOptions={{ maxZoom: 1 }}
          nodesConnectable={false}
          elementsSelectable={false}
          // Scroll mouse tetap menggulir halaman; zoom lewat tombol atau pinch
          zoomOnScroll={false}
          preventScrolling={false}
          aria-label="Peta relasi domain, aspek, indikator, dan rencana kegiatan"
        >
          <Background color="var(--color-lime-500)" gap={22} size={1.5} />
          <Controls showInteractive={false} />
          <Panel position="bottom-right" className="rounded-sm bg-white/85 px-3 py-2 text-small text-grey-200 shadow-sm">
            Klik kotak untuk menandai jalurnya · kotak bisa digeser
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}

export default PetaKegiatan
