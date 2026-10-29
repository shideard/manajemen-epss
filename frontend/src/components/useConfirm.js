import { createElement, useState } from 'react'
import { ConfirmDialog } from './ui'

// Pop-up konfirmasi pengganti confirm() bawaan browser:
//   const [konfirmasi, dialogKonfirmasi] = useConfirm()
//   konfirmasi({ title, message, confirmLabel, danger, onConfirm })   lalu render {dialogKonfirmasi}
// onConfirm boleh async (panggilan API): tombol menampilkan loading sampai selesai, error tampil di pop-up
export function useConfirm() {
  const [opsi, setOpsi] = useState(null)
  return [setOpsi, opsi && createElement(ConfirmDialog, { ...opsi, onClose: () => setOpsi(null) })]
}
