'use client'

import { MessageCircle } from 'lucide-react'

type Props = {
  href: string
  ofertaId: string
}

export function WhatsAppButton({ href, ofertaId }: Props) {
  const handleClick = () => {
    fetch(`/api/ofertas/${ofertaId}/whatsapp`, { method: 'POST' }).catch(() => {})
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1dbc59] transition-colors"
    >
      <MessageCircle className="w-5 h-5" />
      Contactar por WhatsApp
    </a>
  )
}
